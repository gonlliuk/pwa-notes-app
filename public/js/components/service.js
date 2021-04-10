const API_URL = "/api";
const NOTES_STORAGE = "notes-storage";
const ADD_STORAGE = "add-storage";
const EDIT_STORAGE = "edit-storage";
const DELETE_STORAGE = "delete-storage";

const notesMap = new Map();
const notesToAddMap = new Map();
const notesToEditMap = new Map();
const notesToDeleteMap = new Map();

const baseFetchConfig = {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
  },
};

let sendingSavedRequests = false;
let isOfflineModeEnabled = false;
let afterSendSaveRequestsCallback = null;

export function enableOfflineMode(state, callback) {
  isOfflineModeEnabled = state;
  if (isOfflineModeEnabled) {
    initMaps();
    afterSendSaveRequestsCallback = callback;
  }
}

export async function getNotes() {
  let notes = [];
  try {
    notes = await (
      await fetchWrapper(`${API_URL}/notes`, baseFetchConfig)
    ).json();
    if (isOfflineModeEnabled) {
      notesMap.clear();
      for (let note of notes) {
        notesMap.set(note.id, note);
      }
      updateNotesStorage();
    }
    return notes;
  } catch (e) {
    if (isFailedToFetch(e)) {
      const map = new Map();
      for (let [id, note] of notesMap.entries()) {
        map.set(id, note);
      }
      for (let [id, note] of notesToEditMap.entries()) {
        map.set(id, note);
      }
      for (let [id, note] of notesToAddMap.entries()) {
        map.set(id, note);
      }
      for (let id of notesToDeleteMap.keys()) {
        map.delete(id);
      }
      notes = Array.from(map.values());
      return notes;
    } else {
      throw e;
    }
  }
}

export async function addNewNote(note) {
  const fetchConfig = {
    ...baseFetchConfig,
    method: "POST",
  };
  try {
    const newNote = await (
      await fetchWrapper(`${API_URL}/notes`, {
        ...fetchConfig,
        body: JSON.stringify(note),
      })
    ).json();
    return newNote;
  } catch (e) {
    if (isFailedToFetch(e)) {
      addTempIdtoNote(note);
      notesToAddMap.set(note.id, note);
      updateAddNotesStorage();
      return note;
    }
    throw e;
  }
}

export async function editNote(note) {
  const fetchConfig = {
    ...baseFetchConfig,
    method: "PATCH",
  };
  try {
    const editedNote = await (
      await fetchWrapper(`${API_URL}/notes/${note.id}`, {
        ...fetchConfig,
        body: JSON.stringify(note),
      })
    ).json();
    return editedNote;
  } catch (e) {
    if (isFailedToFetch(e)) {
      if (notesToAddMap.has(note.id)) {
        notesToAddMap.set(note.id, note);
        updateAddNotesStorage();
      } else {
        notesToEditMap.set(note.id, note);
        updateEditNotesStorage();
      }
      return note;
    }
    throw e;
  }
}

export async function removeNote(id) {
  const fetchConfig = {
    ...baseFetchConfig,
    method: "DELETE",
    body: JSON.stringify({ id }),
  };
  try {
    await (await fetchWrapper(`${API_URL}/notes/${id}`, fetchConfig)).json();
    return;
  } catch (e) {
    if (isFailedToFetch(e)) {
      if (notesToAddMap.has(id)) {
        notesToAddMap.delete(id);
        updateAddNotesStorage();
      } else {
        notesToDeleteMap.set(id, { id });
        updateDeleteNotesStorage();
      }
      return;
    }
    throw e;
  }
}

function addTempIdtoNote(note) {
  if (!note.id) {
    note.id = Math.random().toFixed(8) + "_TEMP_ID";
  }
}

async function sendSavedRequests() {
  const addItems = JSON.parse(getFormStorage(ADD_STORAGE) || "[]");
  const editItems = JSON.parse(getFormStorage(EDIT_STORAGE) || "[]");
  const deleteItems = JSON.parse(getFormStorage(DELETE_STORAGE) || "[]");

  const requests = [
    ...addItems.map((item) =>
      addNewNote({
        title: item.title,
        text: item.text,
      })
    ),
    ...editItems.map((item) =>
      editNote({
        id: item.id,
        title: item.title,
        text: item.text,
      })
    ),
    ...deleteItems.map((item) => removeNote(item.id)),
  ];

  if (requests.length === 0) {
    return;
  }

  setToStorage(ADD_STORAGE, "[]");
  setToStorage(EDIT_STORAGE, "[]");
  setToStorage(DELETE_STORAGE, "[]");

  try {
    console.log("Sending Saved Requests...");
    await Promise.all(requests);
    console.log("Sending Saved Requests is SUCCESSFUL!");
    console.log("Retrieve final info from server...");
    if (typeof afterSendSaveRequestsCallback === 'function') {
      afterSendSaveRequestsCallback();
    }
    console.log("All info is UPDATED!");
  } catch (e) {
    console.error("Error during restoring state: ", e);
  }
  sendingSavedRequests = false;
}

async function fetchWrapper(...params) {
  const [url, config] = params;
  const res = await fetch(url, config);
  if (!sendingSavedRequests) {
    await sendSavedRequests();
  }
  return res;
}

function isFailedToFetch(error) {
  return isOfflineModeEnabled && error.message.includes("Failed to fetch");
}

function setToStorage(key, item) {
  localStorage.setItem(key, item);
}

function getFormStorage(key) {
  return localStorage.getItem(key);
}

function initMaps() {
  let notes = JSON.parse(getFormStorage(NOTES_STORAGE) || "[]");
  let addNotes = JSON.parse(getFormStorage(ADD_STORAGE) || "[]");
  let editNotes = JSON.parse(getFormStorage(EDIT_STORAGE) || "[]");
  let deleteNotes = JSON.parse(getFormStorage(DELETE_STORAGE) || "[]");

  for (let note of notes) {
    notesMap.set(note.id, note);
  }
  for (let note of addNotes) {
    notesToAddMap.set(note.id, note);
  }
  for (let note of editNotes) {
    notesToEditMap.set(note.id, note);
  }
  for (let note of deleteNotes) {
    notesToDeleteMap.set(note.id);
  }
}

function updateNotesStorage() {
  setToStorage(NOTES_STORAGE, JSON.stringify(Array.from(notesMap.values())));
}

function updateAddNotesStorage() {
  setToStorage(ADD_STORAGE, JSON.stringify(Array.from(notesToAddMap.values())));
}

function updateEditNotesStorage() {
  setToStorage(
    EDIT_STORAGE,
    JSON.stringify(Array.from(notesToEditMap.values()))
  );
}

function updateDeleteNotesStorage() {
  setToStorage(
    DELETE_STORAGE,
    JSON.stringify(Array.from(notesToDeleteMap.values()))
  );
}

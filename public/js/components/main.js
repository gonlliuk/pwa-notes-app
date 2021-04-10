import "./notes-container.js";
import "./new-note-form.js";

import { getNotes, addNewNote, editNote, removeNote, enableOfflineMode } from "./service.js";

const { LitElement, html } = window.LIT_ELEMENT;

class MainElement extends LitElement {
  static get properties() {
    return {
      notes: { type: Array },
    };
  }

  constructor() {
    super();
    this.notes = [];
  }

  createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();
    enableOfflineMode(true, () => this.fetchNotes());
    this.fetchNotes();
  }

  async fetchNotes() {
    this.notes = await getNotes();
  }

  async handleAddNote({ detail: { title, text } }) {
    await addNewNote({ title, text });
    this.fetchNotes();
  }

  async handleEditNote({ detail: { id, title, text } }) {
    await editNote({ id, title, text });
    this.fetchNotes();
  }

  async handleRemoveNote({ detail: { id } }) {
    await removeNote(id);
    this.fetchNotes();
  }

  render() {
    return html`
      <new-note-form-element
        @add-note="${this.handleAddNote}"
      ></new-note-form-element>
      <notes-container-element
        .notes="${this.notes}"
        @edit-note="${this.handleEditNote}"
        @remove-note="${this.handleRemoveNote}"
      ></notes-container-element>
    `;
  }
}

customElements.define("main-element", MainElement);

export default MainElement;

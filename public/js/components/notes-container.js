import "./note.js";

const { LitElement, html } = window.LIT_ELEMENT;

class NotesContainerElement extends LitElement {
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

  render() {
    return html`
      <div id="notes">
        ${this.notes.map(
          (note) => html` <note-element
            id="${note.id}"
            class="item"
            .id="${note.id}"
            .title="${note.title}"
            .text="${note.text}"
          >
          </note-element>`
        )}
      </div>
    `;
  }
}

customElements.define("notes-container-element", NotesContainerElement);

export default NotesContainerElement;

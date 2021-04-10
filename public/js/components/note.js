const { LitElement, html } = window.LIT_ELEMENT;

class NoteElement extends LitElement {
  static get properties() {
    return {
      id: { type: String },
      title: { type: String },
      text: { type: String },
      editTitle: { type: String },
      editText: { type: String },
      editMode: { type: Boolean },
      removeMode: { type: Boolean },
    };
  }

  constructor() {
    super();
    this.id = 0;
    this.title = "";
    this.text = "";
    this.editTitle = "";
    this.editText = "";
    this.editMode = false;
    this.removeMode = false;
  }

  createRenderRoot() {
    return this;
  }

  handleTilteChange(e) {
    this.editTitle = e.target.value;
  }

  handleTextChange(e) {
    this.editText = e.target.value;
  }

  handleToggleEditMode() {
    this.editMode = !this.editMode;
    this.editTitle = this.title;
    this.editText = this.text;
  }

  handleToggleRemoveMode() {
    this.removeMode = !this.removeMode;
  }

  handleEdit() {
    if (!this.editTitle.trim() || !this.editText.trim()) {
      return;
    }
    if (this.editTitle !== this.title || this.editText !== this.text) {
      let event = new CustomEvent("edit-note", {
        detail: {
          id: this.id,
          title: this.editTitle.trim(),
          text: this.editText.trim(),
        },
        bubbles: true,
        composed: true,
      });
      this.dispatchEvent(event);
      this.title = this.editTitle;
      this.text = this.editText;
    }
    this.handleToggleEditMode();
  }

  handleRemove() {
    let event = new CustomEvent("remove-note", {
      detail: {
        id: this.id,
      },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
    this.handleToggleRemoveMode();
  }

  render() {
    return html`
      <div class="note" id="${this.id}">
        <div class="inner">
          ${this.editMode
            ? html`
                <input
                  type="text"
                  name="title"
                  id="new-note-title"
                  placeholder="Title"
                  @change="${this.handleTilteChange}"
                  .value="${this.editTitle}"
                />
                <input
                  type="text"
                  name="text"
                  id="new-note-text"
                  placeholder="Text"
                  @change="${this.handleTextChange}"
                  .value="${this.editText}"
                />
              `
            : html`
                <h3 class="note-title">${this.title}</h3>
                <p class="note-text">${this.text}</p>
              `}
          ${this.editMode
            ? html`
                <button @click="${this.handleEdit}">Apply</button>
                <button @click="${this.handleToggleEditMode}">Cancel</button>
              `
            : this.removeMode
            ? html`
                <button @click="${this.handleRemove}">Apply</button>
                <button @click="${this.handleToggleRemoveMode}">Cancel</button>
              `
            : html`
                <button @click="${this.handleToggleEditMode}">Edit</button>
                <button @click="${this.handleToggleRemoveMode}">Remove</button>
              `}
        </div>
      </div>
    `;
  }
}

customElements.define("note-element", NoteElement);

export default NoteElement;

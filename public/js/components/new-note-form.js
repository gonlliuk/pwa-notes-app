const { LitElement, html } = window.LIT_ELEMENT;

class NewNoteFormElement extends LitElement {
  static get properties() {
    return {
      title: { type: String },
      text: { type: String },
    };
  }

  constructor() {
    super();
    this.title = "";
    this.text = "";
  }

  createRenderRoot() {
    return this;
  }

  handleAdd(e) {
    e.preventDefault();
    if (!this.title.trim() || !this.text.trim()) {
        return;
    }
    let event = new CustomEvent("add-note", {
      detail: {
        title: this.title.trim(),
        text: this.text.trim(),
      },
    });
    this.dispatchEvent(event);
    this.text = "";
    this.title = "";
  }

  handleTilteChange(e) {
    this.title = e.target.value;
  }

  handleTextChange(e) {
    this.text = e.target.value;
  }

  render() {
    return html`
      <form id="add-note-form">
        <input
          type="text"
          name="title"
          id="new-note-title"
          placeholder="Title"
          @change="${this.handleTilteChange}"
          .value="${this.title}"
        />
        <input
          type="text"
          name="text"
          id="new-note-text"
          placeholder="Text"
          @change="${this.handleTextChange}"
          .value="${this.text}"
        />
        <button @click="${this.handleAdd}">Add Note</button>
      </form>
    `;
  }
}

customElements.define("new-note-form-element", NewNoteFormElement);

export default NewNoteFormElement;

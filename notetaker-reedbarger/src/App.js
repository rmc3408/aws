import React, { Component } from "react";
import { withAuthenticator, AmplifySignOut } from "@aws-amplify/ui-react";
import { API, graphqlOperation } from "aws-amplify";
import { createNote, deleteNote, updateNote } from "./graphql/mutations";
import { listNotes } from "./graphql/queries";
import { onCreateNote, onDeleteNote, onUpdateNote } from "./graphql/subscriptions";

class App extends Component {
  state = {
    id: undefined,
    note: "",
    notes: [],
  };

  async getNotes() {
    const resultList = await API.graphql(graphqlOperation(listNotes));
    this.setState({
      notes: [...resultList.data.listNotes.items],
    });
  }
  
  handleNoteChange(evt) {
    this.setState({
      note: evt.target.value,
    });
  }

  hasExistingNote() {
    const { notes, id } = this.state;
    if (id) {
      const isValidIndex = notes.findIndex((n) => n.id === id) > -1;
      console.log(isValidIndex);
      return isValidIndex;
    }
    console.log("not exist");
    return false;
  }

  async addingNote(evt) {
    evt.preventDefault();

    if (this.hasExistingNote()) {
      this.updateNote();
    } else {
      const newCreationNote = { note: this.state.note };
      await API.graphql(
        graphqlOperation(createNote, { input: newCreationNote })
      );
      this.setState((st) => ({
        note: "",
      }));
    }
  }

  async updateNote() {
    const { id, note } = this.state;
    await API.graphql(graphqlOperation(updateNote, { input: { id, note } }));
    this.setState({
      note: "",
      id: "",
    });
  }

  async deletingNote(theID) {
    const deleteTheNote = { id: theID };
    await API.graphql(graphqlOperation(deleteNote, { input: deleteTheNote }));
  }

  async handleSetNote(item) {
    const { note, id } = item;
    this.setState({
      id,
      note,
    });
  }

  async componentDidMount() {
    this.getNotes();

    this.createListener = API.graphql(graphqlOperation(onCreateNote)).subscribe(
      {
        next: (noteData) => {
          const newData = noteData.value.data.onCreateNote;
          const previousData = this.state.notes.filter(
            (note) => note.id !== newData.id
          );
          this.setState({
            notes: [...previousData, newData],
          });
        },
      }
    );

    this.deleteListener = API.graphql(graphqlOperation(onDeleteNote)).subscribe(
      {
        next: (noteData) => {
          this.setState({
            notes: this.state.notes.filter(
              (n) => n.id !== noteData.value.data.onDeleteNote.id
            ),
          });
        },
      }
    );

    this.updateListener = API.graphql(graphqlOperation(onUpdateNote)).subscribe({
      next: upData => {
        const { notes } = this.state;
        let newData = upData.value.data.onUpdateNote;
        const idx = notes.findIndex((n) => n.id === newData.id);
        notes.splice(idx, 1, newData);
        this.setState({ notes });
      },
    });
  }

  componentWillUnmount() {
    this.createListener.unsubscribe();
    this.deleteListener.unsubscribe();
    this.updateListener.unsubscribe();
  }

  

  render() {
    return (
      
      <div className="flex flex-column items-center justify-center pa3 bg-washed-red">
        <AmplifySignOut />
        <h1 className="code f1-l">Note taker Application</h1>

        <form className="mb3" onSubmit={this.addingNote.bind(this)}>
          <input
            type="text"
            className="pa2 f4"
            onChange={this.handleNoteChange.bind(this)}
            value={this.state.note}
          />
          <button type="submit" className="pa2 f4">
            {this.state.id ? "Update" : "Create"}
          </button>
        </form>

        <div>
          {this.state.notes.map((n) => (
            <div key={n.id} className="flex items-center">
              <li className="list pa1 f3" onClick={() => this.handleSetNote(n)}>
                {n.note}
              </li>
              <button
                className="bg-transparent br3 f5"
                onClick={this.deletingNote.bind(this, n.id)}
              >
                <span>&#215;</span>
              </button>
            </div>
          ))}
          </div>
      </div>
      
    );
  }
}

export default withAuthenticator(App);

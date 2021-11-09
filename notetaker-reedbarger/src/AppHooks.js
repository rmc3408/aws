import React, { useState, useEffect } from "react";
import { withAuthenticator, AmplifySignOut } from "@aws-amplify/ui-react";
import { API, graphqlOperation } from "aws-amplify";
import { createNote, deleteNote, updateNote } from "./graphql/mutations";
import { listNotes } from "./graphql/queries";
import {
  onCreateNote,
  onDeleteNote,
  onUpdateNote,
} from "./graphql/subscriptions";

const App = () => {
  const [id, setId] = useState(undefined);
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    getNotes();

    const createListener = API.graphql(
      graphqlOperation(onCreateNote)
    ).subscribe({
      next: (noteData) => {
        const newData = noteData.value.data.onCreateNote;
        setNotes((prevNotes) => {
          const filteredNotes = prevNotes.filter((note) => note.id !== newData.id);
          return [...filteredNotes, newData];
        });
        setNote("");
      },
    });

    const deleteListener = API.graphql(
      graphqlOperation(onDeleteNote)
    ).subscribe({
        next: (noteData) => {
            return notes.filter(n => n.id !== noteData.value.data.onDeleteNote.id);
            
        }
    });

    const updateListener = API.graphql(
      graphqlOperation(onUpdateNote)
    ).subscribe({
      next: (upData) => {
            let newUpdatedData = upData.value.data.onUpdateNote;
            setNotes(prevSt => {
                const idx = prevSt.findIndex((n) => n.id === newUpdatedData.id);
                prevSt.splice(idx, 1, newUpdatedData);
                return prevSt;
            });
            setId('');
            setNote('');
        }
    });

    return () => {
      createListener.unsubscribe();
      deleteListener.unsubscribe();
      updateListener.unsubscribe();
    };
  }, [notes])

  const getNotes = async () => {
    const resultList = await API.graphql(graphqlOperation(listNotes));
    setNotes(resultList.data.listNotes.items);
  };

  const handleNoteChange = (evt) => {
    setNote(evt.target.value);
  };

  const hasExistingNote = () => {
    if (id) {
      const isValidIndex = notes.findIndex((n) => n.id === id) > -1;
      //console.log(isValidIndex);
      return isValidIndex;
    }
    //console.log("not exist");
    return false;
  };

  const addingNote = async (evt) => {
    evt.preventDefault();

    if (hasExistingNote()) {
      theUpdateNote();
    } else {
      const newCreationNote = { note };
      await API.graphql(
        graphqlOperation(createNote, { input: newCreationNote })
      );
      
    }
  };

  const theUpdateNote = async () => {
    await API.graphql(graphqlOperation(updateNote, { input: { id, note } }));
    setId('');
    setNote('');
  };

  const deletingNote = async (theID) => {
    const deleteTheNote = { id: theID };
    await API.graphql(graphqlOperation(deleteNote, { input: deleteTheNote }));
  };

  const handleSetNote = async (item) => {
    const { note, id } = item;
    setId(id);
    setNote(note);
  };

  return (
    <div>
      <div className="mw-7 pa3">
        <AmplifySignOut />
      </div>
      <div className="flex flex-column items-center justify-center pa3 bg-washed-red">
        <h1 className="code f1-l">Note taker Application</h1>

        <form className="mb3" onSubmit={addingNote}>
          <input
            type="text"
            className="pa2 f4"
            onChange={handleNoteChange}
            value={note}
          />
          <button type="submit" className="pa2 f4">
            {id ? "Update" : "Create"}
          </button>
        </form>

        <div>
          {notes.map((n) => (
            <div key={n.id} className="flex items-center">
              <li className="list pa1 f3" onClick={() => handleSetNote(n)}>
                {n.note}
              </li>
              <button
                className="bg-transparent br3 f5"
                onClick={() => deletingNote(n.id)}
              >
                <span>&#215;</span>
              </button>
            </div>
          ))}
        </div>
      </div>{" "}
    </div>
  );
};

export default withAuthenticator(App);

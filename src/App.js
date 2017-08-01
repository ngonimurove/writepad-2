// Import React!
import './App.css';
import keycode from 'keycode';
import React from 'react';
import { Container, Segment } from 'semantic-ui-react'
import { Editor, Raw } from 'slate';

// Update the initial content to be pulled from Local Storage if it exists.
const initialContent = (
  JSON.parse(localStorage.getItem('content')) ||
  {
    nodes: [
      {
        kind: 'block',
        type: 'paragraph'
      }
    ]
  }
)

function MarkHotkey(options) {
  const { type, key, isAltKey = false } = options

  // Return our "plugin" object, containing the `onKeyDown` handler.
  return {
    onKeyDown(event, data, state) {
      // Check that the key pressed matches our `code` option.
      if (!event.metaKey || keycode(event.which) !== key || event.altKey !== isAltKey) return

      // Prevent the default characters from being inserted.
      event.preventDefault()

      // Toggle the mark `type`.
      return state
        .transform()
        .toggleMark(type)
        .apply()
    }
  }
}

const plugins = [
  MarkHotkey({ key: 'b', type: 'bold' }),
  MarkHotkey({ key: 'c', type: 'code', isAltKey: true }),
  MarkHotkey({ key: 'i', type: 'italic' }),
  MarkHotkey({ key: 'd', type: 'strikethrough' }),
  MarkHotkey({ key: 'u', type: 'underline' })
]

// Define our app...
class App extends React.Component {

  // Set the initial state when the app is first constructed.
  state = {
    state: Raw.deserialize(initialContent, {terse: true}),
    schema: {
      nodes: {
        paragraph: props => <Segment {...props.attributes}>{props.children}</Segment>
      },
      marks: {
        bold: props => <strong>{props.children}</strong>,
        code: props => <code>{props.children}</code>,
        italic: props => <em>{props.children}</em>,
        strikethrough: props => <del>{props.children}</del>,
        underline: props => <u>{props.children}</u>,
      }
    }
  }

  // On change, update the app's React state with the new editor state.
  onChange = (state) => {
    this.setState({ state })
  }

  onDocumentChange = (document, state) => {
    // Switch to using the Raw serializer.
    const content = JSON.stringify(Raw.serialize(state))
    localStorage.setItem('content', content)
  }

  // Render the editor.
  render = () => {
    return (
      <Container fluid
        className="notepad"
      >
        <Editor
          plugins={plugins}
          schema={this.state.schema}
          state={this.state.state}
          onChange={this.onChange}
          onDocumentChange={this.onDocumentChange}
          onKeyDown={this.onKeyDown}
        />
      </Container>
    )
  }

}

export default App;
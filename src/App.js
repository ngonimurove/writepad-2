// Import React!
import React from 'react'
import { Editor, Raw } from 'slate'

const initialState = Raw.deserialize({
  nodes: [
    {
      kind: 'block',
      type: 'paragraph',
      nodes: [
        {
          kind: 'text',
          text: 'A line of text in a paragraph.'
        }
      ]
    }
  ]
}, { terse: true })

// Define our app...
class App extends React.Component {

  // Set the initial state when the app is first constructed.
  state = {
    state: initialState
  }

  // On change, update the app's React state with the new editor state.
  onChange = (state) => {
    this.setState({ state })
  }

  // Render the editor.
  render = () => {
    return (
      <Editor
        state={this.state.state}
        onChange={this.onChange}
      />
    )
  }

}

export default App;
// Import React!
import './App.css';
import keycode from 'keycode';
import React from 'react';
import { Container, Segment, Header, Sidebar, Menu, Icon, List } from 'semantic-ui-react'
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
class EditorContainer extends React.Component {

  // Set the initial state when the app is first constructed.
  state = {
    state: Raw.deserialize(initialContent, {terse: true}),
    schema: {
      nodes: {
        paragraph: props => <Segment {...props.attributes}>{props.children}</Segment>,
        section: props => <Segment {...props.attributes}>{props.children}</Segment>, // A section always has a heading at the top
        header: props => <Header as='h3' block {...props.attributes}>{props.children}</Header>,
        group: props => <Segment {...props.attributes}>{props.children}</Segment>,
      },
      marks: {
        bold: props => <strong>{props.children}</strong>,
        code: props => <code>{props.children}</code>,
        italic: props => <em>{props.children}</em>,
        strikethrough: props => <del>{props.children}</del>,
        underline: props => <u>{props.children}</u>,
      }
    },
    readOnly: false
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
      <Editor
        readOnly={this.state.readOnly}
        plugins={plugins}
        schema={this.state.schema}
        state={this.state.state}
        onChange={this.onChange}
        onDocumentChange={this.onDocumentChange}
        onKeyDown={this.onKeyDown}
        className='editor'
      />
    )
  }

}

class App extends React.Component {

  state = {
    sidebar: {
      isVisible: true
    }
  }

  toggleVisibility = () => this.setState({ sidebar: { isVisible: !this.state.sidebar.isVisible }})

  render = () => {
    const { isVisible } = this.state.sidebar
    
    const itemStyle = {
      padding: 0,
    }

    return (
      <Container
        fluid
        className="App"
      >
        <Sidebar 
          as={Menu}
          animation='overlay' 
          direction='top' 
          visible={isVisible} 
          borderless
          color='blue'
        >
          <Menu.Item name='home'>
            <Icon name='write' />
            Writepad 2
          </Menu.Item>
        </Sidebar>
        <div style={{ position: 'fixed', top: 60, left: 0}} id='structureMenu'>
          <List className='context-menu'>
            <List.Item style={itemStyle} disabled={true}><div className='context-menu-item'><Icon name="arrow up" /></div></List.Item>
            <List.Item style={itemStyle} disabled={false}><div className='context-menu-item'><Icon name="arrow down" /></div></List.Item>
            <List.Item style={itemStyle} disabled={false}><div className='context-menu-item'><Icon name="hide" /></div></List.Item>
            <List.Item style={itemStyle} disabled={false}><div className='context-menu-item'><Icon name="lock" /></div></List.Item>
            <List.Item style={itemStyle} disabled={false}><div className='context-menu-item'><Icon name="object group" /></div></List.Item>
          </List>
        </div>
        <EditorContainer />
        <div style={{ position: 'fixed', top: 60, right: 0}} id='ContentMenu'>
          <List className='context-menu'>
            <List.Item style={itemStyle} disabled={false}><div className='context-menu-item'><Icon name="history" /></div></List.Item>
          </List>
        </div>
      </Container>
    )
  }

}

export default App;
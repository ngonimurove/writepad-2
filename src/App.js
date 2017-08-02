// Import React!
import './App.css';
import keycode from 'keycode';
import React from 'react';
import { Container, Segment, Header, Sidebar, Menu, Icon, List, Popup } from 'semantic-ui-react'
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
        paragraph: props => <Segment {...props.attributes} style={{ borderRadius: 0}}>{props.children}</Segment>,
        section: props => <Segment {...props.attributes} style={{ borderRadius: 0}}>
                            <Header as='h3' block {...props.attributes}>{props.children}</Header>
                            {props.children}
                          </Segment>, // A section always has a heading at the top
        group: props => <Segment {...props.attributes} style={{ borderRadius: 0}}>{props.children}</Segment>,
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

    const popupStyle = {
      borderRadius: 0,
      opacity: 0.9,
      padding: 20,
    }

    const popupSize = 'mini'

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
          inverted
        >
          <Menu.Item name='home'>
            <Icon name='write' />
            Writepad 2
          </Menu.Item>
        </Sidebar>
        <div style={{ position: 'fixed', top: 60, left: 0}} id='structureMenu'>
          <List className='context-menu'>
            <Popup
              trigger={<List.Item style={itemStyle} disabled={false}><div className='context-menu-item'><Icon name="arrow up" /></div></List.Item>}
              content='Move up'
              position='right center'
              basic
              inverted
              size={popupSize}
              style={popupStyle} />
            <Popup
              trigger={<List.Item style={itemStyle} disabled={false}><div className='context-menu-item'><Icon name="arrow down" /></div></List.Item>}
              content='Move down'
              position='right center'
              basic
              inverted
              size={popupSize}
              style={popupStyle} />
            <Popup
              trigger={<List.Item style={itemStyle} disabled={false}><div className='context-menu-item'><Icon name="indent" /></div></List.Item>}
              content='Convert to section'
              position='right center'
              basic
              inverted
              size={popupSize}
              style={popupStyle} />
            <Popup
              trigger={<List.Item style={itemStyle} disabled={false}><div className='context-menu-item'><Icon name="list" style={{padding: 0}}/></div></List.Item>}
              content='Convert to list'
              position='right center'
              basic
              inverted
              size={popupSize}
              style={popupStyle} />
            <Popup
              trigger={<List.Item style={itemStyle} disabled={false}><div className='context-menu-item'><Icon name="hide" /></div></List.Item>}
              content='Hide'
              position='right center' 
              basic
              inverted
              size={popupSize}
              style={popupStyle}/>              
            <Popup
              trigger={<List.Item style={itemStyle} disabled={false}><div className='context-menu-item'><Icon name="lock" /></div></List.Item>}
              content='Lock'
              position='right center' 
              basic
              inverted
              size={popupSize}
              style={popupStyle}/>   
            <Popup
              trigger={<List.Item style={itemStyle} disabled={false}><div className='context-menu-item'><Icon name="object group" /></div></List.Item>}
              content='Group'
              position='right center' 
              basic
              inverted
              size={popupSize}
              style={popupStyle}/> 
            <Popup
              trigger={<List.Item style={itemStyle} disabled={false}><div className='context-menu-item'><Icon name="exchange" /></div></List.Item>}
              content='Switch visibility'
              position='right center' 
              basic
              inverted
              size={popupSize}
              style={popupStyle}/> 
            <Popup
              trigger={<List.Item style={itemStyle} disabled={false}><div className='context-menu-item'><Icon name="clone" /></div></List.Item>}
              content='Clone'
              position='right center' 
              basic
              inverted
              size={popupSize}
              style={popupStyle}/>                     
          </List>
        </div>
        <EditorContainer />
        <div style={{ position: 'fixed', top: 60, right: 0}} id='ContentMenu'>
          <List className='context-menu'>
            <Popup
              trigger={<List.Item style={itemStyle} disabled={false}><div className='context-menu-item'><Icon name="checkmark box" /></div></List.Item>}
              content='Check grammar'
              position='left center' 
              basic
              inverted
              size={popupSize}
              style={popupStyle}/>
            <Popup
              trigger={<List.Item style={itemStyle} disabled={false}><div className='context-menu-item'><Icon name="idea" /></div></List.Item>}
              content='Ideas'
              position='left center' 
              basic
              inverted
              size={popupSize}
              style={popupStyle}/>
            <Popup
              trigger={<List.Item style={itemStyle} disabled={false}><div className='context-menu-item'><Icon name="copy" /></div></List.Item>}
              content='Copy as snippet'
              position='left center' 
              basic
              inverted
              size={popupSize}
              style={popupStyle}/>  
            <Popup
              trigger={<List.Item style={itemStyle} disabled={false}><div className='context-menu-item'><Icon name="paste" /></div></List.Item>}
              content='Paste snippet'
              position='left center' 
              basic
              inverted
              size={popupSize}
              style={popupStyle}/> 
            <Popup
              trigger={<List.Item style={itemStyle} disabled={false}><div className='context-menu-item'><Icon name="comment" /></div></List.Item>}
              content='Comments'
              position='left center' 
              basic
              inverted
              size={popupSize}
              style={popupStyle}/>
            <Popup
              trigger={<List.Item style={itemStyle} disabled={false}><div className='context-menu-item'><Icon name="history" /></div></List.Item>}
              content='History'
              position='left center' 
              basic
              inverted
              size={popupSize}
              style={popupStyle}/>
          </List>
        </div>
        <div style={{ position: 'fixed', bottom: 0, right: 0}} id='ContentMenu'>
          <List className='context-menu'>
            <Popup
              trigger={<List.Item style={itemStyle} disabled={false}><div className='context-menu-item-layout'><Icon name="alarm mute" inverted /></div></List.Item>}
              content='Distraction free'
              position='left center' 
              basic
              inverted
              size={popupSize}
              style={popupStyle}/>
            <Popup
              trigger={<List.Item style={itemStyle} disabled={false}><div className='context-menu-item-layout'><Icon name="lightning" inverted /></div></List.Item>}
              content='Quick preview'
              position='left center' 
              basic
              inverted
              size={popupSize}
              style={popupStyle}/> 
          <Popup
              trigger={<List.Item style={itemStyle} disabled={false}><div className='context-menu-item-layout'><Icon name="external square" inverted /></div></List.Item>}
              content='Export'
              position='left center' 
              basic
              inverted
              size={popupSize}
              style={popupStyle}/> 
          </List>
        </div>
        <div style={{ position: 'fixed', bottom: 0, left: 0}} id='ContentMenu'>
          <List className='context-menu'>
            <Popup
              trigger={<List.Item style={itemStyle} disabled={false}><div className='context-menu-item-layout'><Icon name="help" inverted /></div></List.Item>}
              content='Help'
              position='right center' 
              basic
              inverted
              size={popupSize}
              style={popupStyle}/> 
          </List>
        </div>
      </Container>
    )
  }

}

export default App;
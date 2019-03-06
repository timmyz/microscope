import  React from 'react'
import { UIEvent } from 'react'
import  './index.styl'

interface Props {
  style?: object;
  onScroll?: (e: UIEvent)=> void | null;
  onScrollEnd?: (e: UIEvent)=> void | null;
}
class Content extends React.Component<any, any> {
  constructor(props:Props) {
    super(props);
  }
  
  static scrollLatency:number = 300
  static scrollEndTimer:any = null
  static defaultProps = {
    style:{},
    onScroll: null,
    onScrollEnd: null
  }
  scrollHandler(event:any) {
    var self = this;
    var nativeEvent = event.nativeEvent;
    // response on scroll
    if (self.props.onScroll) {
      self.props.onScroll(nativeEvent);
    }
    // response on scrollEnd
    if (self.props.onScrollEnd !== null) {
      if (Content.scrollEndTimer) {
        clearTimeout(Content.scrollEndTimer);
      }
      Content.scrollEndTimer = setTimeout(function() {
        Content.scrollEndTimer = null;
        self.props.onScrollEnd && self.props.onScrollEnd(nativeEvent);
      }, Content.scrollLatency);
    }
  }

  render() {
    return (
      <div className='scrollContent' onScroll={ this.scrollHandler.bind(this) }>
        <div style= {{ width: '100%', position: 'absolute', ...this.props.style }} >
         {this.props.children}
        </div>
      </div>
    )
  }
}

export default Content;

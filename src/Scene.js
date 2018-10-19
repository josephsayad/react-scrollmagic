// @flow
import { default as React } from 'react';
// import debugAddIndicators from './debug.addIndicators.js';

export type PinSettings = {
  pushFollowers?: boolean,
  spacerClass?: string,
}

export type SceneProps = {
  children: Node | Function,

  // scene parameters
  duration?: number | string,
  offset?: number | string,
  triggerHook?: any,
  reverse?: boolean,
  loglevel?: number,
  indicators?: boolean,
  enabled?: boolean,

  /* setClassToggle */
  classToggle?: string | Array<string>,

  /* setPin */
  pin?: boolean | PinSettings,

}

export type SceneBaseProps = SceneProps & {
  controller: any,
}

export type SceneBaseState = {
  event: string,
  progress: number,
}

class SceneBase extends React.PureComponent<SceneBaseProps, SceneBaseState> {
  ref: HTMLElement;
  scene: any;
  state: SceneBaseState = {
    event: 'init',
    progress: 0,
  }

  componentDidMount() {
    if (typeof window !== 'undefined') {
      const ScrollMagic = require('scrollmagic');

      const {
        children,
        controller,
        classToggle,
        pin,
        pinSettings,
        indicators,
        enabled,
        ...sceneParams
      } = this.props;

      //this.check(children, pin, sceneParams);

      const element = this.ref;
      sceneParams.triggerElement = sceneParams.triggerElement === null ? null : sceneParams.triggerElement || element;

      this.scene = new ScrollMagic.Scene(sceneParams);

      this.initEventHandlers();

      if (classToggle) {
        this.setClassToggle(this.scene, element, classToggle);
      }

      if (pin) {
        this.setPin(this.scene, element, pin);
      }

      if (indicators) {
        //debugAddIndicators(ScrollMagic);
        //this.scene.addIndicators({ name: ' ' });
      }

      this.scene.addTo(controller);
    }
  }

  componentWillUnmount() {
    this.scene.destroy();
  }

  check(children, pin, sceneParams) {
    if (!children || (typeof children !== 'function' && children.type.displayName === 'SMScene')) {
      if (pin === true) {
        throw new Error('Prop pin cannot be true. Use an element or element selector if children is null or if you nest a SMScene in another SMScene.');
      }
      if (!sceneParams.triggerElement) {
        throw new Error('You have to define a triggerElement if children is null or if you nest a SMScene in another SMScene.');
      }
    }
  }

  setClassToggle(scene, element, classToggle) {
    if (Array.isArray(classToggle) && classToggle.length === 2) {
      scene.setClassToggle(classToggle[0], classToggle[1]);
    }
    else {
      scene.setClassToggle(element, classToggle);
    }
  }

  setPin(scene, element, pin) {
    scene.setPin(element, pin);
  }

  initEventHandlers() {
    let { children } = this.props;
    if (typeof children !== 'function') {
      return;
    }

    this.scene.on('start', (event) => {
      this.setState({
        event: 'start'
      });
    });

    this.scene.on('end', (event) => {
      this.setState({
        event: 'end'
      });
    });

    this.scene.on('enter', (event) => {
      this.setState({
        event: 'enter'
      });
    });

    this.scene.on('leave', (event) => {
      this.setState({
        event: 'leave'
      });
    });

    this.scene.on('progress', (event) => {
      this.setState({
        progress: event.progress
      });
    });
  }

  render() {
    let { children } = this.props;
    const { event, progress } = this.state;

    if (children && typeof children === 'function') {
      children = children(event, progress);
    }

    const child = React.Children.only(children);
    return React.cloneElement(child, { ref: ref => this.ref = ref });
  }
}

class Scene extends React.PureComponent<SceneProps, {}> {
  static displayName = 'Scene';

  render() {
    if (!this.props.controller) {
      let { children } = this.props;

      if (children && typeof children === 'function') {
        children = children('init', 0);
      }

      const child = React.Children.only(children);
      return child;
    }

    return (
      <SceneBase {...this.props} />
    );
  }
}

export { Scene };
// Parallax effect inspired by https://github.com/oblador/react-native-parallax/

import React, { Component } from 'react';
import { ActivityIndicator, Animated, Easing, Image, View, findNodeHandle } from 'react-native';
import PropTypes from 'prop-types';
import styles from './ParallaxImage.style';

export default class ParallaxImage extends Component {

  static propTypes = {
    ...Image.propTypes,
    AnimatedImageComponent: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.object
    ]), 
    carouselRef: PropTypes.object, // Passed from <Carousel />
    containerStyle: PropTypes.any, 
    dimensions: PropTypes.shape({
      width: PropTypes.number,
      height: PropTypes.number
    }), fadeDuration: PropTypes.number, // Passed from <Carousel />
    itemHeight: PropTypes.number, // Passed from <Carousel />
    itemWidth: PropTypes.number, 
    parallaxFactor: PropTypes.number,
    // Passed from <Carousel />
    scrollPosition: PropTypes.object,
    showSpinner: PropTypes.bool,
    // Passed from <Carousel />
    sliderHeight: PropTypes.number,
    // Passed from <Carousel />
    sliderWidth: PropTypes.number,
    spinnerColor: PropTypes.string,
    // Passed from <Carousel />
    vertical: PropTypes.bool
  };

  static defaultProps = {
    containerStyle: {},
    fadeDuration: 500,
    parallaxFactor: 0.3,
    showSpinner: true,
    spinnerColor: 'rgba(0, 0, 0, 0.4)',
    AnimatedImageComponent: Animated.Image
  };

  constructor (props) {
    super(props);
    this.state = {
      offset: 0,
      width: 0,
      height: 0,
      status: 1, // 1 -> loading; 2 -> loaded // 3 -> transition finished; 4 -> error
      animOpacity: new Animated.Value(0)
    };
    this._onLoad = this._onLoad.bind(this);
    this._onError = this._onError.bind(this);
    this._measureLayout = this._measureLayout.bind(this);
  }

  setNativeProps (nativeProps) {
    this._container.setNativeProps(nativeProps);
  }

  componentDidMount () {
    this._mounted = true;

    setTimeout(() => {
      this._measureLayout();
    }, 0);
  }

  componentWillUnmount () {
    this._mounted = false;
  }

  _measureLayout () {
    if (this._container) {
      const {
        dimensions,
        vertical,
        carouselRef,
        sliderWidth,
        sliderHeight,
        itemWidth,
        itemHeight
      } = this.props;

      if (carouselRef) {
        this._container.measureLayout(
          carouselRef,
          (x, y, width, height, pageX, pageY) => {
            const offset = vertical ?
              y - ((sliderHeight - itemHeight) / 2) :
              x - ((sliderWidth - itemWidth) / 2);

            this.setState({
              offset,
              width: dimensions && dimensions.width ?
                dimensions.width :
                Math.ceil(width),
              height: dimensions && dimensions.height ?
                dimensions.height :
                Math.ceil(height)
            });
          }
        );
      }
    }
  }

  _onLoad (event) {
    const { animOpacity } = this.state,
      { fadeDuration, onLoad } = this.props;

    if (!this._mounted) {
      return;
    }

    this.setState({ status: 2 });

    if (onLoad) {
      onLoad(event);
    }

    Animated.timing(animOpacity, {
      toValue: 1,
      duration: fadeDuration,
      easing: Easing.out(Easing.quad),
      isInteraction: false,
      useNativeDriver: true
    }).start(() => {
      this.setState({ status: 3 });
    });
  }

  // If arg is missing from method signature, it just won't be called
  _onError (event) {
    const { onError } = this.props;

    this.setState({ status: 4 });

    if (onError) {
      onError(event);
    }
  }

  get image () {
    const { status, animOpacity, offset, width, height } = this.state,
      {
        scrollPosition,
        dimensions,
        vertical,
        sliderWidth,
        sliderHeight,
        parallaxFactor,
        style,
        AnimatedImageComponent,
        ...other
      } = this.props,

      parallaxPadding = (vertical ? height : width) * parallaxFactor,
      requiredStyles = { position: 'relative' },
      dynamicStyles = {
        width: vertical ? width : width + parallaxPadding * 2,
        height: vertical ? height + parallaxPadding * 2 : height,
        opacity: animOpacity,
        transform: scrollPosition ? [
          {
            translateX: !vertical ? scrollPosition.interpolate({
              inputRange: [offset - sliderWidth, offset + sliderWidth],
              outputRange: [-parallaxPadding, parallaxPadding],
              extrapolate: 'clamp'
            }) : 0
          },
          {
            translateY: vertical ? scrollPosition.interpolate({
              inputRange: [offset - sliderHeight, offset + sliderHeight],
              outputRange: [-parallaxPadding, parallaxPadding],
              extrapolate: 'clamp'
            }) : 0
          }
        ] : []
      };

    return (
      <AnimatedImageComponent
        {...other}
        onError = {status !== 3 ? this._onError : undefined} // Prevent infinite-loop bug
        onLoad = {this._onLoad}
        style = {[styles.image, style, requiredStyles, dynamicStyles]}
      />
    );
  }

  get spinner () {
    const { status } = this.state,
      { showSpinner, spinnerColor } = this.props;

    return status === 1 && showSpinner ? (
      <View style = {styles.loaderContainer}>
        <ActivityIndicator
          animating = {true}
          color = {spinnerColor}
          size = "small"
        />
      </View>
    ) : false;
  }

  render () {
    const { containerStyle } = this.props;

    return (
      <View
        onLayout = {this._measureLayout}
        pointerEvents = "none"
        ref = {(c) => {
          this._container = c;
        }}
        style = {[containerStyle, styles.container]}
      >
        { this.image }

        { this.spinner }
      </View>
    );
  }
}

import React, { PureComponent } from 'react';
import { Animated, Easing, TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';
import styles from './Pagination.style';

export default class PaginationDot extends PureComponent {

  static propTypes = {
    active: PropTypes.bool,
    activeOpacity: PropTypes.number,
    carouselRef: PropTypes.object,
    color: PropTypes.string,
    containerStyle: PropTypes.any,
    inactiveColor: PropTypes.string,
    inactiveOpacity: PropTypes.number.isRequired,
    inactiveScale: PropTypes.number.isRequired,
    inactiveStyle: PropTypes.any,
    index: PropTypes.number,
    style: PropTypes.any,
    tappable: PropTypes.bool
  };

  constructor (props) {
    super(props);
    this.state = {
      animColor: new Animated.Value(0),
      animOpacity: new Animated.Value(0),
      animTransform: new Animated.Value(0)
    };
  }

  componentDidMount () {
    if (this.props.active) {
      this._animate(1);
    }
  }

  componentDidUpdate (prevProps) {
    if (prevProps.active !== this.props.active) {
      this._animate(this.props.active ? 1 : 0);
    }
  }

  _animate (toValue = 0) {
    const { animColor, animOpacity, animTransform } = this.state,
      { animatedDuration, animatedFriction, animatedTension } = this.props,

      commonProperties = {
        toValue,
        duration: animatedDuration,
        isInteraction: false,
        useNativeDriver: !this._shouldAnimateColor
      },

      animations = [
        Animated.timing(animOpacity, {
          easing: Easing.linear,
          ...commonProperties
        }),
        Animated.spring(animTransform, {
          friction: animatedFriction,
          tension: animatedTension,
          ...commonProperties
        })
      ];

    if (this._shouldAnimateColor) {
      animations.push(Animated.timing(animColor, {
        easing: Easing.linear,
        ...commonProperties
      }));
    }

    Animated.parallel(animations).start();
  }

  get _shouldAnimateColor () {
    const { color, inactiveColor } = this.props;

    return color && inactiveColor;
  }

  render () {
    const { animColor, animOpacity, animTransform } = this.state,
      {
        active,
        activeOpacity,
        carouselRef,
        color,
        containerStyle,
        inactiveColor,
        inactiveStyle,
        inactiveOpacity,
        inactiveScale,
        index,
        style,
        tappable,
        delayPressInDot
      } = this.props,

      animatedStyle = {
        opacity: animOpacity.interpolate({
          inputRange: [0, 1],
          outputRange: [inactiveOpacity, 1]
        }),
        transform: [
          {
            scale: animTransform.interpolate({
              inputRange: [0, 1],
              outputRange: [inactiveScale, 1]
            })
          }
        ]
      },
      animatedColor = this._shouldAnimateColor ? {
        backgroundColor: animColor.interpolate({
          inputRange: [0, 1],
          outputRange: [inactiveColor, color]
        })
      } : {},

      dotContainerStyle = [
        styles.sliderPaginationDotContainer,
        containerStyle || {}
      ],

      dotStyle = [
        styles.sliderPaginationDot,
        style || {},
        (!active && inactiveStyle) || {},
        animatedStyle,
        animatedColor
      ],

      onPress = tappable ? () => {
        try {
          const currentRef = carouselRef.current || carouselRef;
          currentRef._snapToItem(currentRef._getPositionIndex(index));
        } catch (error) {
          console.warn(
                        `react-native-snap-carousel | Pagination: ` +
                    `\`carouselRef\` has to be a Carousel ref.\n${  error}`
          );
        }
      } : undefined;

    return (
      <TouchableOpacity
        accessible = {false}
        activeOpacity = {tappable ? activeOpacity : 1}
        delayPressIn = {delayPressInDot}
        onPress = {onPress}
        style = {dotContainerStyle}
      >
        <Animated.View style = {dotStyle} />
      </TouchableOpacity>
    );
  }
}

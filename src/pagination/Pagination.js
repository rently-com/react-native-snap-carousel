import React, { PureComponent } from 'react';
import { I18nManager, Platform, View } from 'react-native';
import PropTypes from 'prop-types';
import PaginationDot from './PaginationDot';
import styles from './Pagination.style';

const IS_IOS = Platform.OS === 'ios',
  IS_RTL = I18nManager.isRTL;

export default class Pagination extends PureComponent {

  static propTypes = {
    accessibilityLabel: PropTypes.string,
    activeDotIndex: PropTypes.number.isRequired,
    activeOpacity: PropTypes.number,
    animatedDuration: PropTypes.number,
    animatedFriction: PropTypes.number,
    animatedTension: PropTypes.number,
    carouselRef: PropTypes.object,
    containerStyle: PropTypes.any,
    delayPressInDot: PropTypes.number,
    dotColor: PropTypes.string,
    dotContainerStyle: PropTypes.any,
    dotElement: PropTypes.element,
    dotStyle: PropTypes.any,
    dotsLength: PropTypes.number.isRequired,
    inactiveDotColor: PropTypes.string,
    inactiveDotElement: PropTypes.element,
    inactiveDotOpacity: PropTypes.number,
    inactiveDotScale: PropTypes.number,
    inactiveDotStyle: PropTypes.any,
    renderDots: PropTypes.func,
    tappableDots: PropTypes.bool,
    vertical: PropTypes.bool
  };

  static defaultProps = {
    inactiveDotOpacity: 0.5,
    inactiveDotScale: 0.5,
    tappableDots: false,
    vertical: false,
    animatedDuration: 250,
    animatedFriction: 4,
    animatedTension: 50,
    delayPressInDot: 0
  };

  constructor (props) {
    super(props);

    // Warnings
    if ((props.dotColor && !props.inactiveDotColor) || (!props.dotColor && props.inactiveDotColor)) {
      console.warn(
        'react-native-snap-carousel | Pagination: ' +
                'You need to specify both `dotColor` and `inactiveDotColor`'
      );
    }
    if ((props.dotElement && !props.inactiveDotElement) || (!props.dotElement && props.inactiveDotElement)) {
      console.warn(
        'react-native-snap-carousel | Pagination: ' +
                'You need to specify both `dotElement` and `inactiveDotElement`'
      );
    }
    if (props.tappableDots && props.carouselRef === undefined) {
      console.warn(
        'react-native-snap-carousel | Pagination: ' +
                'You must specify prop `carouselRef` when setting `tappableDots` to `true`'
      );
    }
  }

  _needsRTLAdaptations () {
    const { vertical } = this.props;

    return IS_RTL && !IS_IOS && !vertical;
  }

  get _activeDotIndex () {
    const { activeDotIndex, dotsLength } = this.props;

    return this._needsRTLAdaptations() ? dotsLength - activeDotIndex - 1 : activeDotIndex;
  }

  get dots () {
    const {
      activeOpacity,
      carouselRef,
      dotsLength,
      dotColor,
      dotContainerStyle,
      dotElement,
      dotStyle,
      inactiveDotColor,
      inactiveDotElement,
      inactiveDotOpacity,
      inactiveDotScale,
      inactiveDotStyle,
      renderDots,
      tappableDots,
      animatedDuration,
      animatedFriction,
      animatedTension,
      delayPressInDot
    } = this.props;

    if (renderDots) {
      return renderDots(this._activeDotIndex, dotsLength, this);
    }

    const DefaultDot = (<PaginationDot
        activeOpacity = {activeOpacity}
        animatedDuration = {animatedDuration}
        animatedFriction = {animatedFriction}
        animatedTension = {animatedTension}
        carouselRef = {carouselRef}
        color = {dotColor}
        containerStyle = {dotContainerStyle}
        delayPressInDot = {delayPressInDot}
        inactiveColor = {inactiveDotColor}
        inactiveOpacity = {inactiveDotOpacity}
        inactiveScale = {inactiveDotScale}
        inactiveStyle = {inactiveDotStyle}
        style = {dotStyle}
        tappable = {tappableDots ? typeof carouselRef !== 'undefined' : null}
      />),

      dots = [...Array(dotsLength).keys()].map((i) => {
        const isActive = i === this._activeDotIndex;

        return React.cloneElement(
          (isActive ? dotElement : inactiveDotElement) || DefaultDot,
          {
            key: `pagination-dot-${i}`,
            active: isActive,
            index: i
          }
        );
      });

    return dots;
  }

  render () {
    const { dotsLength, containerStyle, vertical, accessibilityLabel } = this.props;

    if (!dotsLength || dotsLength < 2) {
      return false;
    }

    const style = [
      styles.sliderPagination,
      { flexDirection: vertical ?
        'column' :
        (this._needsRTLAdaptations() ? 'row-reverse' : 'row')
      },
      containerStyle || {}
    ];

    return (
      <View
        accessibilityLabel = {accessibilityLabel}
        accessible = {Boolean(accessibilityLabel)}
        pointerEvents = "box-none"
        style = {style}
      >
        { this.dots }
      </View>
    );
  }
}

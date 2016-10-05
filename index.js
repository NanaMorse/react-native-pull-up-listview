import * as React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ListView,
  PanResponder,
  Animated,
  Easing
} from 'react-native';

import IndicatorCircle from './IndicatorCircle';

const PropTypes = React.PropTypes;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    position: 'relative',
    overflow: 'hidden',
    flex: 1
  },

  footer: {
    alignItems: 'center'
  }
});

// status concepts constants
const STATUS_NORMAL = Symbol('STATUS_NORMAL');
const STATUS_PRE_LOAD = Symbol('STATUS_PRE_LOAD');
const STATUS_LOADING = Symbol('STATUS_LOADING');

// describe how long you should pull to make the indicator circle running complete
// it will be set as 1/5 of the listView's container's height
// when the container's onLayout method invoking
let pullToCompleteRange = null;

// animated footer's top value, it changes when you pulling up the listView over it's max offset
const footerAnimatedTopValue = new Animated.Value(0);

// will be true on PanResponderMoving
let responderHandling = false;

// will be true when indicator circle completed
let loadMoreInvoked = false;

// cache container's size for calculating listView's max offset Y
let containerSize;

// cache footer's size
let footerSize;

const pullRangeCoverToTopValueRatio = 5 / 8;

const footerPaddingVertical = 10;

class PullUpListView extends React.Component {

  constructor(props) {
    super();

    this.state = {
      statusCode: props.loading ? STATUS_LOADING : STATUS_NORMAL
    };
  }

  componentWillMount() {
    this.panResponder = PanResponder.create({
      onPanResponderMove: () => {
        responderHandling = true;
      },

      onPanResponderRelease: () => {
        responderHandling = false;
        loadMoreInvoked = false;

        if (this.state.statusCode === STATUS_PRE_LOAD) {
          this.listViewRef.scrollTo({ y: this.OFFSET_Y_MAX });
        }
      }
    });
  }

  componentDidMount() {
    // register listView instance's methods
    const methodsList = ['getMetrics', 'scrollTo'];

    methodsList.forEach((method) => {
      this[method] = (...args) => {
        this.listViewRef[method](...args);
      }
    });
  }

  componentWillUpdate(props) {
    // set statusCode according to loading props
    // todo bad practice
    this.state.statusCode = props.loading ? STATUS_LOADING : STATUS_NORMAL;
  }

  renderFooter() {

    if (!this.props.onLoadMore) return;

    const statusCode = this.state.statusCode;

    let footerContext;

    if (statusCode === STATUS_NORMAL) return null;

    if (statusCode === STATUS_PRE_LOAD) {

      const containerHeight = containerSize.height;

      const preLoadStyle = {
        position: 'absolute',
        left: 0,
        right: 0,
        top: footerAnimatedTopValue.interpolate({
          inputRange: [containerHeight, containerHeight + pullToCompleteRange],
          outputRange: [containerHeight, containerHeight + pullToCompleteRange * pullRangeCoverToTopValueRatio]
        })
      };

      footerContext = (
        <Animated.View style={preLoadStyle}>
          <View style={styles.footer} onLayout={this.onPreLoadFooterLayout.bind(this)}>
            <IndicatorCircle
              ref= {(indicatorCircle) => { this.indicatorCircle = indicatorCircle; }}
              onCircleComplete={() => {this.props.onLoadMore(); loadMoreInvoked = true}}
              color={this.props.tintColor}
              size={this.props.size}
            />
            <Text style={{color: this.props.titleColor}}>{this.props.title}</Text>
          </View>
        </Animated.View>
      );
    }

    if (statusCode === STATUS_LOADING) {

      const listStyle = StyleSheet.flatten(this.props.style);

      const loadingStyle = [styles.footer, {
        paddingVertical: footerPaddingVertical,
        backgroundColor: listStyle ? listStyle.backgroundColor : 'transparent'
      }];

      footerContext = (
        <View style={loadingStyle}>
          <IndicatorCircle animated={true} color={this.props.tintColor} size={this.props.size}/>
          <Text style={{color: this.props.titleColor}}>{this.props.title}</Text>
        </View>
      );
    }

    return footerContext;
  }

  onScroll(e) {
    const { contentSize, contentOffset } = e.nativeEvent;

    const containerHeight = containerSize.height;
    const contentHeight = contentSize.height;

    const OFFSET_Y_MAX = containerHeight > contentHeight ? 0 : contentHeight - containerHeight;

    // if user pull up listView
    if (contentOffset.y > OFFSET_Y_MAX && responderHandling) {

      if (loadMoreInvoked) return;

      if (this.state.statusCode === STATUS_NORMAL) {

        // cache OFFSET_Y_MAX for scroll back when user release handing
        this.OFFSET_Y_MAX = OFFSET_Y_MAX;

        footerAnimatedTopValue.setValue(containerHeight);

        this.setState({ statusCode: STATUS_PRE_LOAD });
      }
    }

    // if listView scroll back to normal status
    else if (contentOffset.y < OFFSET_Y_MAX) {
      if (this.state.statusCode === STATUS_PRE_LOAD) {
        this.setState({ statusCode: STATUS_NORMAL });
      }
    }

    // if listView scrolling on preload status, and footer has been initialized
    if (this.state.statusCode === STATUS_PRE_LOAD && footerSize) {
      const currentPullRange = contentOffset.y - OFFSET_Y_MAX;

      if ( currentPullRange * pullRangeCoverToTopValueRatio < (footerSize.height + footerPaddingVertical)) {
        Animated.timing(footerAnimatedTopValue, {
          toValue: containerHeight - currentPullRange,
          easing: Easing.linear,
          duration: 0
        }).start();
      }

      const renderCircleDeg = 360 / pullToCompleteRange * currentPullRange;
      this.indicatorCircle.refreshRenderedDeg(renderCircleDeg);
    }

  }

  onContainerLayout(e) {
    containerSize = e.nativeEvent.layout;
    pullToCompleteRange = containerSize.height / 5;
  }

  onPreLoadFooterLayout(e) {
    footerSize = e.nativeEvent.layout;
  }

  render() {
    const containerProps = {
      onLayout: this.onContainerLayout.bind(this),
      style: styles.container
    };

    const listViewProps = {
      onScroll: mixFuncs(this.onScroll.bind(this), this.props.onScroll),
      onLoading: this.props.onLoading,

      ref: (listView) => { this.listViewRef = listView; },

      scrollEventThrottle: this.props.scrollEventThrottle
    };

    return (
      <View {...containerProps}>
        <ListView {...this.props} {...this.panResponder.panHandlers} {...listViewProps} />
        {this.renderFooter()}
      </View>
    );
  }
}

function mixFuncs(...funcs) {
  return (...args) => {
    funcs.forEach(func => func && func(...args));
  }
}

PullUpListView.propTypes = {
  tintColor: PropTypes.string,
  title: PropTypes.string,
  titleColor: PropTypes.string,
  size: PropTypes.number,

  loading: PropTypes.bool,
  onLoadMore: PropTypes.func
};

PullUpListView.defaultProps = {
  tintColor: 'gray',
  title: 'Load More...',
  titleColor: '#000000',
  size: 36,
  scrollEventThrottle: 10
};




export default PullUpListView;
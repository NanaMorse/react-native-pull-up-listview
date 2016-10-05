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

const STATUS_NORMAL = 0;
const STATUS_PRE_LOAD = 1;
const STATUS_LOADING = 3;

let pullToCompleteRange;

let loadMoreInvoked = false;

class PullUpListView extends React.Component {

  constructor(props) {
    super();

    this.state = {
      statusCode: props.loading ? STATUS_LOADING : STATUS_NORMAL,
      footerTopAnimatedValue: new Animated.Value(0)
    };

    this.responderHandling = false;
    this.containerSize = {};
  }

  componentWillMount() {
    this.panResponder = PanResponder.create({
      onPanResponderMove: () => {
        this.responderHandling = true;
      },

      onPanResponderRelease: () => {

        this.responderHandling = false;
        loadMoreInvoked = false;

        if (this.state.statusCode === STATUS_PRE_LOAD) {
          this.listViewRef.scrollTo({
            y: this.OFFSET_Y_MAX
          });
        }
      }
    });
  }

  componentDidMount() {
    // register all methods for listView instance
    const methodsList = [
      'getMetrics', 'scrollTo'
    ];

    methodsList.forEach((method) => {
      this[method] = (...args) => {
        this.listViewRef[method](...args);
      }
    });
  }

  componentWillUpdate(props) {
    this.state.statusCode = props.loading ? STATUS_LOADING : STATUS_NORMAL;
  }

  renderFooter() {

    if (!this.props.onLoadMore) return;

    const statusCode = this.state.statusCode;

    let footerContext;

    if (statusCode === STATUS_NORMAL) return null;

    if (statusCode === STATUS_PRE_LOAD) {

      const preLoadStyle = [styles.footer, {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        top: this.state.footerTopAnimatedValue.interpolate({
          inputRange: [this.containerSize.height, this.containerSize.height + pullToCompleteRange],
          outputRange: [this.containerSize.height, this.containerSize.height + pullToCompleteRange / 16 * 10]
        })
      }];

      footerContext = (
        <Animated.View style={preLoadStyle}>
          <IndicatorCircle
            ref= {(indicatorCircle) => { this.indicatorCircle = indicatorCircle; }}
            onCircleComplete={() => {this.props.onLoadMore(); loadMoreInvoked = true}}
            color={this.props.tintColor}
            size={this.props.size}
          />
          <Text style={{color: this.props.titleColor}}>{this.props.title}</Text>
        </Animated.View>
      );
    }

    if (statusCode === STATUS_LOADING) {

      const listStyle = StyleSheet.flatten(this.props.style);

      const loadingStyle = [styles.footer, {
        paddingTop: 10,
        backgroundColor: listStyle ? listStyle.backgroundColor : 'transparent'
      }];

      footerContext = (
        <View style={loadingStyle}>
          <IndicatorCircle animated={true}  color={this.props.tintColor}  size={this.props.size}/>
          <Text style={{color: this.props.titleColor}}>{this.props.title}</Text>
        </View>
      );
    }

    return footerContext;
  }

  onScroll(e) {
    const { contentSize, contentOffset } = e.nativeEvent;

    const containerHeight = this.containerSize.height;
    const contentHeight = contentSize.height;

    const OFFSET_Y_MAX = containerHeight > contentHeight ? 0 : contentHeight - containerHeight;

    if (contentOffset.y > (OFFSET_Y_MAX + this.props.pullDistance) && this.responderHandling) {

      if (loadMoreInvoked) return;

      if (this.state.statusCode === STATUS_NORMAL) {

        this.OFFSET_Y_MAX = OFFSET_Y_MAX;

        pullToCompleteRange = containerHeight / 5;

        this.setState({
          statusCode: STATUS_PRE_LOAD
        });

        this.state.footerTopAnimatedValue.setValue(containerHeight);
      }
    }

    else if (contentOffset.y < (this.OFFSET_Y_MAX + this.props.pullDistance)) {
      if (this.state.statusCode === STATUS_PRE_LOAD) {
        this.setState({
          statusCode: STATUS_NORMAL
        });
      }
    }

    if (this.state.statusCode === STATUS_PRE_LOAD) {

      const currentPullRange = contentOffset.y - OFFSET_Y_MAX;

      Animated.timing(this.state.footerTopAnimatedValue, {
        toValue: containerHeight - currentPullRange,
        easing: Easing.linear,
        duration: 1
      }).start();

      const renderCircleDeg = 360 / pullToCompleteRange * (currentPullRange - this.props.pullDistance);

      this.indicatorCircle.refreshRenderedDeg(renderCircleDeg);
    }

  }

  onContainerLayout(e) {
    this.containerSize = e.nativeEvent.layout;
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
  pullDistance: PropTypes.number,
  tintColor: PropTypes.string,
  title: PropTypes.string,
  titleColor: PropTypes.string,
  size: PropTypes.number,

  loading: PropTypes.bool,
  onLoadMore: PropTypes.func
};

PullUpListView.defaultProps = {
  pullDistance: 10,
  tintColor: 'gray',
  title: 'Load More...',
  titleColor: '#000000',
  size: 36,
  scrollEventThrottle: 1
};




export default PullUpListView;
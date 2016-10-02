import * as React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ListView,
  PanResponder
} from 'react-native';

import IndicatorCircle from './IndicatorCircle';

const PropTypes = React.PropTypes;

const styles = StyleSheet.create({
  container: {
    flex: 1
  },

  footer: {
    alignItems: 'center',
    paddingTop: 10
  }
});

const STATUS_NORMAL = 0;
const STATUS_PRE_LOAD = 1;
const STATUS_LOADING = 3;

class PullUpListView extends React.Component {

  constructor(props) {
    super();

    this.state = {
      statusCode: props.loading ? STATUS_LOADING : STATUS_NORMAL,
      refreshing: false,
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
      footerContext = (
        <View style={styles.footer}>
          <IndicatorCircle
            ref= {(indicatorCircle) => { this.indicatorCircle = indicatorCircle; }}
            onCircleComplete={this.props.onLoadMore}
          />
          <Text>{this.props.title}</Text>
        </View>
      );
    }

    if (statusCode === STATUS_LOADING) {
      footerContext = (
        <View style={styles.footer}>
          <IndicatorCircle animated={true}/>
          <Text>{this.props.title}</Text>
        </View>
      );
    }

    return (
      <View style={styles.footer}>
        {footerContext}
      </View>
    );
  }

  onScroll(e) {
    const { contentSize, contentOffset } = e.nativeEvent;

    const containerHeight = this.containerSize.height;
    const contentHeight = contentSize.height;

    const OFFSET_Y_MAX = containerHeight > contentHeight ? 0 : contentHeight - containerHeight;

    if (contentOffset.y > (OFFSET_Y_MAX + this.props.pullDistance) && this.responderHandling) {

      if (this.state.statusCode === STATUS_NORMAL) {

        this.OFFSET_Y_MAX = OFFSET_Y_MAX;

        this.setState({
          statusCode: STATUS_PRE_LOAD
        });
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

      const renderCircleDeg = (- 9 * (OFFSET_Y_MAX - contentOffset.y)) - 9 * this.props.pullDistance;

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
      renderFooter: this.renderFooter.bind(this),
      onScroll: mixFuncs(this.onScroll.bind(this), this.props.onScroll),
      onLoading: this.props.onLoading,

      ref: (listView) => { this.listViewRef = listView; },

      scrollEventThrottle: this.props.scrollEventThrottle,

      style: {
        position: 'relative'
      }
    };

    return (
      <View {...containerProps}>
        <ListView {...this.props} {...this.panResponder.panHandlers} {...listViewProps}/>
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

  loading: PropTypes.bool,
  onLoadMore: PropTypes.func
};

PullUpListView.defaultProps = {
  pullDistance: 10,
  tintColor: 'gray',
  title: 'Load More...',
  titleColor: '#000000',
  scrollEventThrottle: 100
};




export default PullUpListView;
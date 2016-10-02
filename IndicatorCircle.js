import * as React from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';

const PropTypes = React.PropTypes;

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    position: 'relative'
  },

  circleLineWrapper: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    position: 'absolute',
    left: 0,
    top: 0
  },

  circleLine: {
    height: 3,
    borderRadius: 3
  }
});

const degBetweenLines = 30;

let completed = false;

class IndicatorCircle extends React.Component {

  constructor() {
    super();

    this.state = {
      renderDeg: 0,
      animatedRotateValue: new Animated.Value(0)
    };

    completed = false;
  }

  generateCircleLines() {
    let linesNum = Math.floor(this.state.renderDeg / degBetweenLines) + 1;

    if (linesNum <= 0) linesNum = 1;

    if (linesNum > 12) linesNum = 12;

    let lineColorArray = [];

    if (this.props.animated) {
      linesNum = 12;
      // todo, calculate colors array by props.color
      lineColorArray = ['#A3A3A3', '#AFAFAF', '#B7B7B7', '#BFBFBF', '#C7C7C7', '#CECECE'];
    }

    const linesElementArray = [];

    for (let i = 0; i < linesNum; i++ ) {

      const lineWrapperRotateStyle = {
        height: this.props.size,
        width: this.props.size,
        transform: [
          {
            rotate: `${degBetweenLines * i - 90}deg`
          }
        ]
      };

      const lineStyle = {
        backgroundColor: this.props.animated ?
          (lineColorArray[i] || lineColorArray[lineColorArray.length - 1])
          : this.props.color,
        width: this.props.size * 10 / 36
      };

      linesElementArray.push(
        <View key={i} style={[styles.circleLineWrapper, lineWrapperRotateStyle]}>
          <View style={[styles.circleLine, lineStyle]} />
        </View>
      );
    }

    return linesElementArray;
  }

  onCircleComplete() {
    if (completed) return;

    completed = true;
    this.props.onCircleComplete();
  }

  refreshRenderedDeg(deg) {
    this.setState({
      renderDeg: deg
    }, () => {
      if (this.state.renderDeg >= 360) {
        this.onCircleComplete();
      }
    });
  }

  componentDidMount() {
    if (this.props.animated) {
      this.startContainerRotateAnimate();
    }
  }

  componentDidUpdate(props) {
    if (this.props.animated) {
      this.startContainerRotateAnimate();
    }
  }

  startContainerRotateAnimate() {
    this.state.animatedRotateValue.setValue(0);
    Animated.timing(this.state.animatedRotateValue, {
      toValue: 360,
      duration: 800,
      easing: Easing.linear
    }).start(this.startContainerRotateAnimate.bind(this));
  }

  render() {

    const containerStyle = [
      styles.container,
      {
        height: this.props.size,
        width: this.props.size
      }
    ];

    let containerRotateStyle;

    if (this.props.animated) {

      const [inputRange, outputRange] = (() => {
        let degStart = 0;

        const inputRange = [];
        const outputRange = [];

        do {

          inputRange.push(degStart);
          outputRange.push(`${degStart}deg`);

          degStart += degBetweenLines;

          if (degStart <= 360) {
            inputRange.push(degStart - 0.1);
            outputRange.push(`${degStart - degBetweenLines}deg`);
          }

        } while (degStart <= 360);

        return [inputRange, outputRange];
      })();

      containerRotateStyle = {
        transform: [
          {
            rotate: this.state.animatedRotateValue.interpolate({
              inputRange: inputRange,
              outputRange: outputRange
            })
          }
        ]
      }
    }

    return (
      <Animated.View style={[containerStyle, containerRotateStyle]}>
        {this.generateCircleLines()}
      </Animated.View>
    )
  }
}

IndicatorCircle.propTypes = {
  color: PropTypes.string,
  size: PropTypes.number,
  onCircleComplete: PropTypes.func,
  animated: PropTypes.bool
};

IndicatorCircle.defaultProps = {
  color: 'rgb(183,183,183)',
  size: 36,
  onCircleComplete: () => { console.log('CircleComplete') }
};

export default IndicatorCircle;

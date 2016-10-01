import * as React from 'react';
import { View, StyleSheet } from 'react-native';

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
      renderDeg: 0
    };

    completed = false;
  }

  generateCircleLines() {
    let linesNum = Math.floor(this.state.renderDeg / degBetweenLines) + 1;

    if (linesNum <= 0) linesNum = 1;

    if (linesNum > 12) linesNum = 12;

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
        backgroundColor: this.props.color,
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

  render() {
    return (
      <View style={[styles.container, {height: this.props.size, width: this.props.size}]}>
        {this.generateCircleLines()}
      </View>
    )
  }
}

IndicatorCircle.propTypes = {
  color: PropTypes.string,
  size: PropTypes.number,
  onCircleComplete: PropTypes.func
};

IndicatorCircle.defaultProps = {
  color: 'rgb(183,183,183)',
  size: 36,
  onCircleComplete: () => { console.log('CircleComplete') }
};

export default IndicatorCircle;

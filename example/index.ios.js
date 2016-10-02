/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  ListView,
  RefreshControl
} from 'react-native';

import PullUpListView from 'react-native-pull-up-listview';

const dataList = [
  {
    text: 'dataRow'
  },
  {
    text: 'dataRow'
  },
  {
    text: 'dataRow'
  },
  {
    text: 'dataRow'
  },
  {
    text: 'dataRow'
  },
  {
    text: 'dataRow'
  },
  {
    text: 'dataRow'
  },
  {
    text: 'dataRow'
  },
  {
    text: 'dataRow'
  },
  {
    text: 'dataRow'
  },
];

const loadMoreDataList = [
  {
    text: 'loadMoreDataRow-1'
  },
  {
    text: 'loadMoreDataRow-2'
  },
  {
    text: 'loadMoreDataRow-3'
  },
  {
    text: 'loadMoreDataRow-4'
  },
];


const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20
  },

  list: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
    borderColor: '#000',
    borderBottomWidth: 1
  }
});


class example extends Component {

  constructor() {
    super();

    this.state = {
      refreshing: false,
      loading: false,
      dataList: dataList
    };

    this.dataSource = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
  }

  renderList(listDataInfo) {
    return (
      <View style={styles.list}>
        <Text>{listDataInfo.text}</Text>
      </View>
    )
  }

  onLoadMore() {
    this.setState({
      loading: true
    });

    setTimeout(() => {
      this.setState({
        dataList: [...this.state.dataList, ...loadMoreDataList],
        loading: false
      });
    }, 2000);
  }

  onRefresh() {
    this.setState({
      refreshing: true
    });

    setTimeout(() => {
      this.setState({
        refreshing: false
      });
    }, 2000)
  }

  render() {
    const pullUpListViewProps = {
      dataSource: this.dataSource.cloneWithRows(this.state.dataList),
      renderRow: this.renderList.bind(this),
      loading: this.state.loading,
      onLoadMore: this.onLoadMore.bind(this),

      refreshControl: <RefreshControl refreshing={this.state.refreshing} onRefresh={this.onRefresh.bind(this)}/>
    };

    return (
      <View style={styles.container}>
        <PullUpListView {...pullUpListViewProps}/>
      </View>
    );
  }
}

AppRegistry.registerComponent('example', () => example);

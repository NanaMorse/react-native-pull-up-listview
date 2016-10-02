import * as React from 'react';

declare namespace RNPUL {
  
  interface PullUpListViewProps {
    
    // Whether the listView should show an active loadMore indicator.
    loading: boolean;
    
    // Called when the listView starts loading more.
    onLoadMore: Function;

    // The indicator color.
    tintColor?: string;

    // The title displayed under the loadMore indicator.
    title?: string;

    // The title's color.
    titleColor?: string;
  }
  
  export default class PullUpListView extends React.Component<PullUpListViewProps, {}> {}
}

export = RNPUL;
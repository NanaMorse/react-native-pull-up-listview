# react-native-pull-up-listview

A listview for react-native, provide an ability of pulling up to load more list row.

## Install

``` shell
$ npm i --save react-native-pull-up-listview
```

## Props

- `loading` bool (required)
	
	Whether the listView should show an active loadMore indicator.
	
- `onLoadMore` function (required)

	Called when the listView starts loading more.
	
- `tintColor` string (option, default = 'gray')

	The indicator color.
	
- `title` string (option, default = 'load more...')

	The title displayed under the loadMore indicator.
	
- `titleColor` string (option, default = 'black')

	The title's color.
	
	
## Example

See the `example` folder.
# react-native-pull-up-listview

A listview for react-native, provide an ability of pulling up to load more list row.

![](https://raw.githubusercontent.com/NanaMorse/react-native-pull-up-listview/master/example/snapshoots/snapshot.gif)

## Install

``` shell
$ npm i --save react-native-pull-up-listview
```

PS: If you find something wrong with this repo, try to up to date within npm and test again. Else you can create an issue and I will figure it out as soon as possible, thx!

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
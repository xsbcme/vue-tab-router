# 外链导航
内部实现由 `window.open` 实现，使用 `_viewOutside` 标记即可，它将不会在标签页中打开。

## 导航超链接页面
想要外链超链接页面，可以使用 `tabsManager.openTab` 方法。

```ts
// 打开浏览器标签打开百度页面
tabsManager.openTab('http://www.baidu.com/',{
    _viewOutside: true
});

// 打开浏览器标签打开百度页面，并给页面传入参数
tabsManager.openTab('http://www.baidu.com/',{
    _viewOutside: true,
    username: '李四'
});

// 打开相对路径页面
tabsManager.openTab('relative:./home',{
    _viewOutside: true
});

// 打开相对路径页面，并给页面传入参数
tabsManager.openTab('relative:./home',{
    _viewOutside: true,
    username: '王五'
});
```
与内联导航处理链接的方式一致，唯一区别是将会以浏览器的标签页显示。

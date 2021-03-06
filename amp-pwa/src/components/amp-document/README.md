# "AMP Document" React Component

A lightweight [React](https://facebook.github.io/react/) component that takes an [AMP](https://www.ampproject.org) document URL as input and renders it.

## User Guide

```sh
npm install react-amp-document
```

**./index.html**
```
<head>
  <!-- Include AMP runtime with Shadow DOM API. -->
  <script async src="https://cdn.ampproject.org/shadow-v0.js"></script>
</head>
```

**./index.js**
```
import AMPDocument from 'react-amp-document/amp-document';

// Create an <AMPDocument> and set its `src` prop to an AMP document URL:
ReactDOM.render(<AMPDocument src="https://ampbyexample.com" />);
```

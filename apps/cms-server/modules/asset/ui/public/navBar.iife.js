var NavBar = (function(exports) {
  "use strict";
  function _typeof(o) {
    "@babel/helpers - typeof";
    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
      return typeof o2;
    } : function(o2) {
      return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
    }, _typeof(o);
  }
  function toPrimitive(t, r2) {
    if ("object" != _typeof(t) || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r2);
      if ("object" != _typeof(i)) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r2 ? String : Number)(t);
  }
  function toPropertyKey(t) {
    var i = toPrimitive(t, "string");
    return "symbol" == _typeof(i) ? i : i + "";
  }
  function _defineProperty(e, r2, t) {
    return (r2 = toPropertyKey(r2)) in e ? Object.defineProperty(e, r2, {
      value: t,
      enumerable: true,
      configurable: true,
      writable: true
    }) : e[r2] = t, e;
  }
  function _objectWithoutPropertiesLoose(r2, e) {
    if (null == r2) return {};
    var t = {};
    for (var n in r2) if ({}.hasOwnProperty.call(r2, n)) {
      if (-1 !== e.indexOf(n)) continue;
      t[n] = r2[n];
    }
    return t;
  }
  function _objectWithoutProperties(e, t) {
    if (null == e) return {};
    var o, r2, i = _objectWithoutPropertiesLoose(e, t);
    if (Object.getOwnPropertySymbols) {
      var n = Object.getOwnPropertySymbols(e);
      for (r2 = 0; r2 < n.length; r2++) o = n[r2], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]);
    }
    return i;
  }
  function getDefaultExportFromCjs(x) {
    return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
  }
  var react = { exports: {} };
  var react_production_min = {};
  /**
   * @license React
   * react.production.min.js
   *
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   */
  var hasRequiredReact_production_min;
  function requireReact_production_min() {
    if (hasRequiredReact_production_min) return react_production_min;
    hasRequiredReact_production_min = 1;
    var l = Symbol.for("react.element"), n = Symbol.for("react.portal"), p = Symbol.for("react.fragment"), q = Symbol.for("react.strict_mode"), r2 = Symbol.for("react.profiler"), t = Symbol.for("react.provider"), u = Symbol.for("react.context"), v = Symbol.for("react.forward_ref"), w = Symbol.for("react.suspense"), x = Symbol.for("react.memo"), y = Symbol.for("react.lazy"), z = Symbol.iterator;
    function A(a) {
      if (null === a || "object" !== typeof a) return null;
      a = z && a[z] || a["@@iterator"];
      return "function" === typeof a ? a : null;
    }
    var B = { isMounted: function() {
      return false;
    }, enqueueForceUpdate: function() {
    }, enqueueReplaceState: function() {
    }, enqueueSetState: function() {
    } }, C = Object.assign, D = {};
    function E(a, b, e) {
      this.props = a;
      this.context = b;
      this.refs = D;
      this.updater = e || B;
    }
    E.prototype.isReactComponent = {};
    E.prototype.setState = function(a, b) {
      if ("object" !== typeof a && "function" !== typeof a && null != a) throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");
      this.updater.enqueueSetState(this, a, b, "setState");
    };
    E.prototype.forceUpdate = function(a) {
      this.updater.enqueueForceUpdate(this, a, "forceUpdate");
    };
    function F() {
    }
    F.prototype = E.prototype;
    function G(a, b, e) {
      this.props = a;
      this.context = b;
      this.refs = D;
      this.updater = e || B;
    }
    var H = G.prototype = new F();
    H.constructor = G;
    C(H, E.prototype);
    H.isPureReactComponent = true;
    var I = Array.isArray, J = Object.prototype.hasOwnProperty, K = { current: null }, L = { key: true, ref: true, __self: true, __source: true };
    function M(a, b, e) {
      var d, c = {}, k = null, h = null;
      if (null != b) for (d in void 0 !== b.ref && (h = b.ref), void 0 !== b.key && (k = "" + b.key), b) J.call(b, d) && !L.hasOwnProperty(d) && (c[d] = b[d]);
      var g = arguments.length - 2;
      if (1 === g) c.children = e;
      else if (1 < g) {
        for (var f = Array(g), m = 0; m < g; m++) f[m] = arguments[m + 2];
        c.children = f;
      }
      if (a && a.defaultProps) for (d in g = a.defaultProps, g) void 0 === c[d] && (c[d] = g[d]);
      return { $$typeof: l, type: a, key: k, ref: h, props: c, _owner: K.current };
    }
    function N(a, b) {
      return { $$typeof: l, type: a.type, key: b, ref: a.ref, props: a.props, _owner: a._owner };
    }
    function O(a) {
      return "object" === typeof a && null !== a && a.$$typeof === l;
    }
    function escape(a) {
      var b = { "=": "=0", ":": "=2" };
      return "$" + a.replace(/[=:]/g, function(a2) {
        return b[a2];
      });
    }
    var P = /\/+/g;
    function Q(a, b) {
      return "object" === typeof a && null !== a && null != a.key ? escape("" + a.key) : b.toString(36);
    }
    function R(a, b, e, d, c) {
      var k = typeof a;
      if ("undefined" === k || "boolean" === k) a = null;
      var h = false;
      if (null === a) h = true;
      else switch (k) {
        case "string":
        case "number":
          h = true;
          break;
        case "object":
          switch (a.$$typeof) {
            case l:
            case n:
              h = true;
          }
      }
      if (h) return h = a, c = c(h), a = "" === d ? "." + Q(h, 0) : d, I(c) ? (e = "", null != a && (e = a.replace(P, "$&/") + "/"), R(c, b, e, "", function(a2) {
        return a2;
      })) : null != c && (O(c) && (c = N(c, e + (!c.key || h && h.key === c.key ? "" : ("" + c.key).replace(P, "$&/") + "/") + a)), b.push(c)), 1;
      h = 0;
      d = "" === d ? "." : d + ":";
      if (I(a)) for (var g = 0; g < a.length; g++) {
        k = a[g];
        var f = d + Q(k, g);
        h += R(k, b, e, f, c);
      }
      else if (f = A(a), "function" === typeof f) for (a = f.call(a), g = 0; !(k = a.next()).done; ) k = k.value, f = d + Q(k, g++), h += R(k, b, e, f, c);
      else if ("object" === k) throw b = String(a), Error("Objects are not valid as a React child (found: " + ("[object Object]" === b ? "object with keys {" + Object.keys(a).join(", ") + "}" : b) + "). If you meant to render a collection of children, use an array instead.");
      return h;
    }
    function S(a, b, e) {
      if (null == a) return a;
      var d = [], c = 0;
      R(a, d, "", "", function(a2) {
        return b.call(e, a2, c++);
      });
      return d;
    }
    function T(a) {
      if (-1 === a._status) {
        var b = a._result;
        b = b();
        b.then(function(b2) {
          if (0 === a._status || -1 === a._status) a._status = 1, a._result = b2;
        }, function(b2) {
          if (0 === a._status || -1 === a._status) a._status = 2, a._result = b2;
        });
        -1 === a._status && (a._status = 0, a._result = b);
      }
      if (1 === a._status) return a._result.default;
      throw a._result;
    }
    var U = { current: null }, V = { transition: null }, W = { ReactCurrentDispatcher: U, ReactCurrentBatchConfig: V, ReactCurrentOwner: K };
    function X() {
      throw Error("act(...) is not supported in production builds of React.");
    }
    react_production_min.Children = { map: S, forEach: function(a, b, e) {
      S(a, function() {
        b.apply(this, arguments);
      }, e);
    }, count: function(a) {
      var b = 0;
      S(a, function() {
        b++;
      });
      return b;
    }, toArray: function(a) {
      return S(a, function(a2) {
        return a2;
      }) || [];
    }, only: function(a) {
      if (!O(a)) throw Error("React.Children.only expected to receive a single React element child.");
      return a;
    } };
    react_production_min.Component = E;
    react_production_min.Fragment = p;
    react_production_min.Profiler = r2;
    react_production_min.PureComponent = G;
    react_production_min.StrictMode = q;
    react_production_min.Suspense = w;
    react_production_min.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = W;
    react_production_min.act = X;
    react_production_min.cloneElement = function(a, b, e) {
      if (null === a || void 0 === a) throw Error("React.cloneElement(...): The argument must be a React element, but you passed " + a + ".");
      var d = C({}, a.props), c = a.key, k = a.ref, h = a._owner;
      if (null != b) {
        void 0 !== b.ref && (k = b.ref, h = K.current);
        void 0 !== b.key && (c = "" + b.key);
        if (a.type && a.type.defaultProps) var g = a.type.defaultProps;
        for (f in b) J.call(b, f) && !L.hasOwnProperty(f) && (d[f] = void 0 === b[f] && void 0 !== g ? g[f] : b[f]);
      }
      var f = arguments.length - 2;
      if (1 === f) d.children = e;
      else if (1 < f) {
        g = Array(f);
        for (var m = 0; m < f; m++) g[m] = arguments[m + 2];
        d.children = g;
      }
      return { $$typeof: l, type: a.type, key: c, ref: k, props: d, _owner: h };
    };
    react_production_min.createContext = function(a) {
      a = { $$typeof: u, _currentValue: a, _currentValue2: a, _threadCount: 0, Provider: null, Consumer: null, _defaultValue: null, _globalName: null };
      a.Provider = { $$typeof: t, _context: a };
      return a.Consumer = a;
    };
    react_production_min.createElement = M;
    react_production_min.createFactory = function(a) {
      var b = M.bind(null, a);
      b.type = a;
      return b;
    };
    react_production_min.createRef = function() {
      return { current: null };
    };
    react_production_min.forwardRef = function(a) {
      return { $$typeof: v, render: a };
    };
    react_production_min.isValidElement = O;
    react_production_min.lazy = function(a) {
      return { $$typeof: y, _payload: { _status: -1, _result: a }, _init: T };
    };
    react_production_min.memo = function(a, b) {
      return { $$typeof: x, type: a, compare: void 0 === b ? null : b };
    };
    react_production_min.startTransition = function(a) {
      var b = V.transition;
      V.transition = {};
      try {
        a();
      } finally {
        V.transition = b;
      }
    };
    react_production_min.unstable_act = X;
    react_production_min.useCallback = function(a, b) {
      return U.current.useCallback(a, b);
    };
    react_production_min.useContext = function(a) {
      return U.current.useContext(a);
    };
    react_production_min.useDebugValue = function() {
    };
    react_production_min.useDeferredValue = function(a) {
      return U.current.useDeferredValue(a);
    };
    react_production_min.useEffect = function(a, b) {
      return U.current.useEffect(a, b);
    };
    react_production_min.useId = function() {
      return U.current.useId();
    };
    react_production_min.useImperativeHandle = function(a, b, e) {
      return U.current.useImperativeHandle(a, b, e);
    };
    react_production_min.useInsertionEffect = function(a, b) {
      return U.current.useInsertionEffect(a, b);
    };
    react_production_min.useLayoutEffect = function(a, b) {
      return U.current.useLayoutEffect(a, b);
    };
    react_production_min.useMemo = function(a, b) {
      return U.current.useMemo(a, b);
    };
    react_production_min.useReducer = function(a, b, e) {
      return U.current.useReducer(a, b, e);
    };
    react_production_min.useRef = function(a) {
      return U.current.useRef(a);
    };
    react_production_min.useState = function(a) {
      return U.current.useState(a);
    };
    react_production_min.useSyncExternalStore = function(a, b, e) {
      return U.current.useSyncExternalStore(a, b, e);
    };
    react_production_min.useTransition = function() {
      return U.current.useTransition();
    };
    react_production_min.version = "18.3.1";
    return react_production_min;
  }
  var hasRequiredReact;
  function requireReact() {
    if (hasRequiredReact) return react.exports;
    hasRequiredReact = 1;
    {
      react.exports = requireReact_production_min();
    }
    return react.exports;
  }
  var reactExports = requireReact();
  const React = /* @__PURE__ */ getDefaultExportFromCjs(reactExports);
  var jsxRuntime = { exports: {} };
  var reactJsxRuntime_production_min = {};
  /**
   * @license React
   * react-jsx-runtime.production.min.js
   *
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   */
  var hasRequiredReactJsxRuntime_production_min;
  function requireReactJsxRuntime_production_min() {
    if (hasRequiredReactJsxRuntime_production_min) return reactJsxRuntime_production_min;
    hasRequiredReactJsxRuntime_production_min = 1;
    var f = requireReact(), k = Symbol.for("react.element"), l = Symbol.for("react.fragment"), m = Object.prototype.hasOwnProperty, n = f.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner, p = { key: true, ref: true, __self: true, __source: true };
    function q(c, a, g) {
      var b, d = {}, e = null, h = null;
      void 0 !== g && (e = "" + g);
      void 0 !== a.key && (e = "" + a.key);
      void 0 !== a.ref && (h = a.ref);
      for (b in a) m.call(a, b) && !p.hasOwnProperty(b) && (d[b] = a[b]);
      if (c && c.defaultProps) for (b in a = c.defaultProps, a) void 0 === d[b] && (d[b] = a[b]);
      return { $$typeof: k, type: c, key: e, ref: h, props: d, _owner: n.current };
    }
    reactJsxRuntime_production_min.Fragment = l;
    reactJsxRuntime_production_min.jsx = q;
    reactJsxRuntime_production_min.jsxs = q;
    return reactJsxRuntime_production_min;
  }
  var hasRequiredJsxRuntime;
  function requireJsxRuntime() {
    if (hasRequiredJsxRuntime) return jsxRuntime.exports;
    hasRequiredJsxRuntime = 1;
    {
      jsxRuntime.exports = requireReactJsxRuntime_production_min();
    }
    return jsxRuntime.exports;
  }
  var jsxRuntimeExports = requireJsxRuntime();
  function r(e) {
    var t, f, n = "";
    if ("string" == typeof e || "number" == typeof e) n += e;
    else if ("object" == typeof e) if (Array.isArray(e)) {
      var o = e.length;
      for (t = 0; t < o; t++) e[t] && (f = r(e[t])) && (n && (n += " "), n += f);
    } else for (f in e) e[f] && (n && (n += " "), n += f);
    return n;
  }
  function clsx() {
    for (var e, t, f = 0, n = "", o = arguments.length; f < o; f++) (e = arguments[f]) && (t = r(e)) && (n && (n += " "), n += t);
    return n;
  }
  function _objectDestructuringEmpty(t) {
    if (null == t) throw new TypeError("Cannot destructure " + t);
  }
  function _extends() {
    return _extends = Object.assign ? Object.assign.bind() : function(n) {
      for (var e = 1; e < arguments.length; e++) {
        var t = arguments[e];
        for (var r2 in t) ({}).hasOwnProperty.call(t, r2) && (n[r2] = t[r2]);
      }
      return n;
    }, _extends.apply(null, arguments);
  }
  var _excluded$1o = ["appearance", "busy", "disabled", "children", "className", "hint", "pressed", "type"];
  function ownKeys$1p(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread$1p(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys$1p(Object(t), true).forEach(function(r3) {
        _defineProperty(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$1p(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  var Button = /* @__PURE__ */ reactExports.forwardRef(function(_ref, ref) {
    var appearance = _ref.appearance, busy = _ref.busy, disabled = _ref.disabled, children = _ref.children, className = _ref.className, hint = _ref.hint, pressed = _ref.pressed, type = _ref.type, restProps = _objectWithoutProperties(_ref, _excluded$1o);
    return jsxRuntimeExports.jsx("button", _objectSpread$1p(_objectSpread$1p({
      ref,
      className: clsx("utrecht-button", busy && "utrecht-button--busy", disabled && "utrecht-button--disabled", type === "submit" && "utrecht-button--submit", appearance === "primary-action-button" && "utrecht-button--primary-action", appearance === "secondary-action-button" && "utrecht-button--secondary-action", appearance === "subtle-button" && "utrecht-button--subtle", hint === "danger" && "utrecht-button--danger", hint === "warning" && "utrecht-button--warning", hint === "ready" && "utrecht-button--ready", pressed === true && "utrecht-button--pressed", className),
      "aria-busy": busy || void 0,
      "aria-pressed": typeof pressed === "boolean" ? pressed : void 0,
      disabled,
      type: type || "button"
    }, restProps), {}, {
      children
    }));
  });
  Button.displayName = "Button";
  var _excluded$1n = ["appearance", "className", "level"];
  function ownKeys$1o(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread$1o(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys$1o(Object(t), true).forEach(function(r3) {
        _defineProperty(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$1o(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  var Heading = /* @__PURE__ */ reactExports.forwardRef(function(_ref, ref) {
    var appearance = _ref.appearance, className = _ref.className, level = _ref.level, restProps = _objectWithoutProperties(_ref, _excluded$1n);
    var appearances = ["utrecht-heading-1", "utrecht-heading-2", "utrecht-heading-3", "utrecht-heading-4", "utrecht-heading-5", "utrecht-heading-6"];
    var HeadingX = level === 2 ? "h2" : level === 3 ? "h3" : level === 4 ? "h4" : level === 5 ? "h5" : level === 6 ? "h6" : "h1";
    var headingClassName = appearance && appearances.indexOf(appearance) !== -1 ? appearance : appearances[level - 1] || "utrecht-heading-1";
    return jsxRuntimeExports.jsx(HeadingX, _objectSpread$1o(_objectSpread$1o({
      className: clsx(headingClassName, className)
    }, restProps), {}, {
      ref
    }));
  });
  Heading.displayName = "Heading";
  var _excluded$1m = ["id", "label", "className", "headingLevel", "expanded", "disabled", "section", "children", "buttonRef", "onActivate", "onButtonBlur", "onButtonFocus", "icon", "appearance"], _excluded2$9 = ["children", "group", "headingLevel", "heading"];
  function ownKeys$1n(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread$1n(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys$1n(Object(t), true).forEach(function(r3) {
        _defineProperty(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$1n(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  var IconChevronDown = function IconChevronDown2() {
    return jsxRuntimeExports.jsxs("svg", {
      id: "Layer_1",
      xmlns: "http://www.w3.org/2000/svg",
      width: "14",
      height: "8",
      viewBox: "0 0 14 8",
      children: [jsxRuntimeExports.jsx("defs", {
        children: jsxRuntimeExports.jsx("clipPath", {
          id: "clippath",
          children: jsxRuntimeExports.jsx("rect", {
            width: "14",
            height: "8",
            style: {
              fill: "none",
              strokeWidth: "0px"
            }
          })
        })
      }), jsxRuntimeExports.jsx("g", {
        style: {
          clipPath: "url(#clippath)"
        },
        children: jsxRuntimeExports.jsx("path", {
          d: "m7,8c-.26,0-.51-.1-.71-.29L.29,1.71C-.1,1.32-.1.68.29.29S1.32-.1,1.71.29l5.29,5.29L12.29.29c.39-.39,1.02-.39,1.41,0s.39,1.02,0,1.41l-6,6c-.2.2-.45.29-.71.29Z",
          style: {
            strokeWidth: "0px;"
          }
        })
      })]
    });
  };
  var AccordionSection = /* @__PURE__ */ reactExports.forwardRef(function(_ref, ref) {
    var id = _ref.id, label = _ref.label, className = _ref.className, _ref$headingLevel = _ref.headingLevel, headingLevel = _ref$headingLevel === void 0 ? 1 : _ref$headingLevel, _ref$expanded = _ref.expanded, expanded = _ref$expanded === void 0 ? false : _ref$expanded, disabled = _ref.disabled, section = _ref.section, children = _ref.children, buttonRef = _ref.buttonRef, onActivate = _ref.onActivate, onButtonBlur = _ref.onButtonBlur, onButtonFocus = _ref.onButtonFocus, icon = _ref.icon, appearance = _ref.appearance, props = _objectWithoutProperties(_ref, _excluded$1m);
    var panelAttributes = {
      className: clsx("utrecht-accordion__panel", {
        "utrecht-accordion__panel--expanded": expanded
      }),
      // Use the `hidden` attribute so the toggle works even without CSS
      hidden: !expanded,
      // Use the `aria-hidden` attribute too, so it even works when CSS
      // doesn't use `display: none` to make transitions.
      "aria-hidden": !expanded
    };
    var iconStart = icon ? icon : icon === null ? null : jsxRuntimeExports.jsx(IconChevronDown, {});
    if (appearance === "utrecht") {
      iconStart = null;
    }
    var idPrefix = "utrecht-accordion";
    var idSuffix = id || reactExports.useId();
    var buttonId = "".concat(idPrefix).concat(idSuffix, "-button");
    var panelId = "".concat(idPrefix).concat(idSuffix, "-panel");
    return jsxRuntimeExports.jsxs("div", _objectSpread$1n(_objectSpread$1n({
      className: clsx("utrecht-accordion__section", className),
      id,
      ref
    }, props), {}, {
      children: [jsxRuntimeExports.jsx(Heading, {
        level: headingLevel,
        className: clsx("utrecht-accordion__header"),
        children: jsxRuntimeExports.jsxs(Button, {
          className: clsx("utrecht-accordion__button", _defineProperty({}, "utrecht-accordion__button--utrecht", appearance === "utrecht")),
          appearance: "subtle-button",
          "aria-expanded": expanded === true,
          "aria-controls": panelId,
          disabled,
          id: buttonId,
          onClick: function onClick() {
            return typeof onActivate === "function" && onActivate(ref);
          },
          onFocus: function onFocus() {
            return typeof onButtonFocus === "function" && onButtonFocus(ref);
          },
          onBlur: function onBlur() {
            return typeof onButtonBlur === "function" && onButtonBlur(ref);
          },
          ref: buttonRef,
          children: [iconStart && jsxRuntimeExports.jsx("span", {
            className: "utrecht-accordion__button-icon",
            children: iconStart
          }), jsxRuntimeExports.jsx("span", {
            className: "utrecht-accordion__button-label",
            children: label
          })]
        })
      }), section ? jsxRuntimeExports.jsx("section", _objectSpread$1n(_objectSpread$1n({
        id: panelId,
        "aria-labelledby": buttonId
      }, panelAttributes), {}, {
        children
      })) : jsxRuntimeExports.jsx("div", _objectSpread$1n(_objectSpread$1n({
        id: panelId
      }, panelAttributes), {}, {
        children
      }))]
    }));
  });
  AccordionSection.displayName = "AccordionSection";
  var Accordion = /* @__PURE__ */ reactExports.forwardRef(function(_ref2, ref) {
    var children = _ref2.children, group = _ref2.group, headingLevel = _ref2.headingLevel, heading = _ref2.heading, props = _objectWithoutProperties(_ref2, _excluded2$9);
    var headingId = reactExports.useId();
    return jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, {
      children: [!!heading && typeof headingLevel === "number" && jsxRuntimeExports.jsx(Heading, {
        level: headingLevel,
        children: heading
      }), jsxRuntimeExports.jsx("div", _objectSpread$1n(_objectSpread$1n({
        className: clsx("utrecht-accordion"),
        role: group ? "group" : void 0,
        "aria-labelledby": group ? headingId : void 0
      }, props), {}, {
        ref,
        children
      }))]
    });
  });
  Accordion.displayName = "Accordion";
  var _excluded$1l = ["children", "className", "icon", "type"];
  function ownKeys$1m(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread$1m(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys$1m(Object(t), true).forEach(function(r3) {
        _defineProperty(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$1m(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  var Alert = /* @__PURE__ */ reactExports.forwardRef(function(_ref, ref) {
    var children = _ref.children, className = _ref.className, icon = _ref.icon, type = _ref.type, restProps = _objectWithoutProperties(_ref, _excluded$1l);
    return jsxRuntimeExports.jsxs("div", _objectSpread$1m(_objectSpread$1m({}, restProps), {}, {
      ref,
      className: clsx("utrecht-alert", {
        "utrecht-alert--error": type === "error",
        "utrecht-alert--info": type === "info",
        "utrecht-alert--ok": type === "ok",
        "utrecht-alert--warning": type === "warning"
      }, className),
      children: [icon && jsxRuntimeExports.jsx("div", {
        className: "utrecht-alert__icon",
        children: icon
      }), jsxRuntimeExports.jsx("div", {
        className: "utrecht-alert__message",
        children
      })]
    }));
  });
  Alert.displayName = "Alert";
  var _excluded$1k = ["children", "className", "icon", "type"];
  function ownKeys$1l(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread$1l(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys$1l(Object(t), true).forEach(function(r3) {
        _defineProperty(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$1l(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  var AlertDialog = /* @__PURE__ */ reactExports.forwardRef(function(_ref, ref) {
    var children = _ref.children, className = _ref.className, icon = _ref.icon, type = _ref.type, restProps = _objectWithoutProperties(_ref, _excluded$1k);
    return jsxRuntimeExports.jsxs("dialog", _objectSpread$1l(_objectSpread$1l({}, restProps), {}, {
      ref,
      className: clsx("utrecht-alert-dialog", {
        "utrecht-alert-dialog--error": type === "error",
        "utrecht-alert-dialog--info": type === "info",
        "utrecht-alert-dialog--warning": type === "warning",
        className
      }),
      children: [icon && jsxRuntimeExports.jsx("div", {
        className: "utrecht-alert-dialog__icon",
        children: icon
      }), jsxRuntimeExports.jsx("div", {
        className: "utrecht-alert-dialog__message",
        children
      })]
    }));
  });
  AlertDialog.displayName = "AlertDialog";
  var _excluded$1j = ["children", "className"];
  function ownKeys$1k(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread$1k(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys$1k(Object(t), true).forEach(function(r3) {
        _defineProperty(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$1k(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  var Article = /* @__PURE__ */ reactExports.forwardRef(function(_ref, ref) {
    var children = _ref.children, className = _ref.className, restProps = _objectWithoutProperties(_ref, _excluded$1j);
    return jsxRuntimeExports.jsx("article", _objectSpread$1k(_objectSpread$1k({}, restProps), {}, {
      ref,
      className: clsx("utrecht-article", className),
      children
    }));
  });
  Article.displayName = "Article";
  var _excluded$1i = ["children", "className"];
  function ownKeys$1j(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread$1j(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys$1j(Object(t), true).forEach(function(r3) {
        _defineProperty(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$1j(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  var Backdrop = /* @__PURE__ */ reactExports.forwardRef(function(_ref, ref) {
    var children = _ref.children, className = _ref.className, restProps = _objectWithoutProperties(_ref, _excluded$1i);
    return jsxRuntimeExports.jsx("div", _objectSpread$1j(_objectSpread$1j({}, restProps), {}, {
      ref,
      className: clsx("utrecht-backdrop", className),
      children
    }));
  });
  Backdrop.displayName = "Backdrop";
  var _excluded$1h = ["children", "className", "value"];
  function ownKeys$1i(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread$1i(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys$1i(Object(t), true).forEach(function(r3) {
        _defineProperty(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$1i(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  var BadgeCounter = /* @__PURE__ */ reactExports.forwardRef(function(_ref, ref) {
    var children = _ref.children, className = _ref.className, value = _ref.value, restProps = _objectWithoutProperties(_ref, _excluded$1h);
    var props = _objectSpread$1i({
      children,
      className: clsx("utrecht-badge-counter", className)
    }, restProps);
    return typeof value !== "undefined" ? jsxRuntimeExports.jsx("data", _objectSpread$1i(_objectSpread$1i({}, props), {}, {
      value,
      ref
    })) : jsxRuntimeExports.jsx("span", _objectSpread$1i(_objectSpread$1i({}, props), {}, {
      ref
    }));
  });
  BadgeCounter.displayName = "BadgeCounter";
  var _excluded$1g = ["children", "className"];
  function ownKeys$1h(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread$1h(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys$1h(Object(t), true).forEach(function(r3) {
        _defineProperty(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$1h(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  var BadgeList = /* @__PURE__ */ reactExports.forwardRef(function(_ref, ref) {
    var children = _ref.children, className = _ref.className, restProps = _objectWithoutProperties(_ref, _excluded$1g);
    return jsxRuntimeExports.jsx("div", _objectSpread$1h(_objectSpread$1h({}, restProps), {}, {
      ref,
      className: clsx("utrecht-badge-list", className),
      children
    }));
  });
  BadgeList.displayName = "BadgeList";
  var _excluded$1f = ["children", "className", "attribution"];
  function ownKeys$1g(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread$1g(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys$1g(Object(t), true).forEach(function(r3) {
        _defineProperty(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$1g(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  var Blockquote = /* @__PURE__ */ reactExports.forwardRef(function(_ref, ref) {
    var children = _ref.children, className = _ref.className, attribution = _ref.attribution, restProps = _objectWithoutProperties(_ref, _excluded$1f);
    return jsxRuntimeExports.jsxs("blockquote", _objectSpread$1g(_objectSpread$1g({}, restProps), {}, {
      ref,
      className: clsx("utrecht-blockquote", className),
      children: [children, attribution && jsxRuntimeExports.jsx("div", {
        className: "utrecht-blockquote__attribution",
        children: attribution
      })]
    }));
  });
  Blockquote.displayName = "Blockquote";
  var _excluded$1e = ["boxContent", "children", "className", "external", "href", "placeholder", "role"];
  function ownKeys$1f(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread$1f(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys$1f(Object(t), true).forEach(function(r3) {
        _defineProperty(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$1f(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  var Link = /* @__PURE__ */ reactExports.forwardRef(function(_ref, ref) {
    var boxContent = _ref.boxContent, children = _ref.children, className = _ref.className, external = _ref.external, href = _ref.href, placeholder = _ref.placeholder, role = _ref.role, restProps = _objectWithoutProperties(_ref, _excluded$1e);
    return (
      // "utrecht-link--telephone" does not have a corresponding API,
      // since it is primarily a basis for implementing input[href^="tel"].
      // Telephone number rendering in React is best achieved using composition
      // of the TelephoneValue component.
      jsxRuntimeExports.jsx("a", _objectSpread$1f(_objectSpread$1f({
        href: placeholder ? void 0 : href,
        ref,
        role: role || (placeholder ? "link" : void 0),
        className: clsx("utrecht-link", "utrecht-link--html-a", {
          "utrecht-link--box-content": boxContent,
          "utrecht-link--external": external,
          "utrecht-link--placeholder": placeholder
        }, className),
        "aria-disabled": placeholder ? "true" : void 0,
        rel: external ? "external noopener noreferrer" : void 0
      }, restProps), {}, {
        children
      }))
    );
  });
  Link.displayName = "Link";
  var _excluded$1d = ["appearance", "children", "className", "headingLevel", "label"], _excluded2$8 = ["className", "children"], _excluded3$2 = ["className", "children"], _excluded4$1 = ["children", "disabled", "current", "href", "index", "rel", "role", "Link", "className"];
  function ownKeys$1e(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread$1e(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys$1e(Object(t), true).forEach(function(r3) {
        _defineProperty(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$1e(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  var useMicrodataItem = function useMicrodataItem2(_ref) {
    var prop = _ref.prop, type = _ref.type;
    return {
      itemScope: true,
      itemType: type,
      itemProp: prop
    };
  };
  var useMicrodataProp = function useMicrodataProp2(prop) {
    return {
      itemProp: prop
    };
  };
  var BreadcrumbNav = /* @__PURE__ */ reactExports.forwardRef(function(_ref2, ref) {
    var appearance = _ref2.appearance, children = _ref2.children, className = _ref2.className, _ref2$headingLevel = _ref2.headingLevel, headingLevel = _ref2$headingLevel === void 0 ? 2 : _ref2$headingLevel, label = _ref2.label, restProps = _objectWithoutProperties(_ref2, _excluded$1d);
    var headingId = label ? reactExports.useId() : void 0;
    return jsxRuntimeExports.jsxs("nav", _objectSpread$1e(_objectSpread$1e({}, restProps), {}, {
      ref,
      className: clsx("utrecht-breadcrumb-nav", "utrecht-breadcrumb-nav--html-ol", {
        "utrecht-breadcrumb-nav--arrows": appearance === "arrows"
      }, className),
      "aria-labelledby": headingId,
      children: [label && jsxRuntimeExports.jsx(Heading, {
        id: headingId,
        className: "utrecht-breadcrumb-nav__heading",
        level: headingLevel,
        "aria-hidden": "true",
        children: label
      }), jsxRuntimeExports.jsx("ol", _objectSpread$1e(_objectSpread$1e({
        className: "utrecht-breadcrumb-nav__list utrecht-breadcrumb-nav__list--html-ol"
      }, useMicrodataItem({
        type: "https://schema.org/BreadcrumbList"
      })), {}, {
        children
      }))]
    }));
  });
  BreadcrumbNav.displayName = "BreadcrumbNav";
  var BreadcrumbNavItem = /* @__PURE__ */ reactExports.forwardRef(function(_ref3, ref) {
    var className = _ref3.className, children = _ref3.children, restProps = _objectWithoutProperties(_ref3, _excluded2$8);
    return jsxRuntimeExports.jsx("li", _objectSpread$1e(_objectSpread$1e(_objectSpread$1e({
      className: clsx("utrecht-breadcrumb-nav__item", className)
    }, useMicrodataItem({
      type: "https://schema.org/ListItem",
      prop: "itemListElement"
    })), {}, {
      ref
    }, restProps), {}, {
      children
    }));
  });
  BreadcrumbNavItem.displayName = "BreadcrumbNavItem";
  var BreadcrumbNavSeparator = /* @__PURE__ */ reactExports.forwardRef(function(_ref4, ref) {
    var className = _ref4.className, children = _ref4.children, restProps = _objectWithoutProperties(_ref4, _excluded3$2);
    return jsxRuntimeExports.jsx("li", _objectSpread$1e(_objectSpread$1e({
      "aria-hidden": "true",
      hidden: true,
      style: {
        display: "var(--_utrecht-breadcrumb-nav-separator-display, block)"
      },
      className: clsx("utrecht-breadcrumb-nav__separator", "utrecht-breadcrumb-nav__separator--html-li", className),
      ref
    }, restProps), {}, {
      children
    }));
  });
  BreadcrumbNavSeparator.displayName = "BreadcrumbNavSeparator";
  var BreadcrumbNavLink = /* @__PURE__ */ reactExports.forwardRef(function(_ref5, ref) {
    var children = _ref5.children, disabled = _ref5.disabled, current = _ref5.current, href = _ref5.href, index = _ref5.index, rel = _ref5.rel, role = _ref5.role, _ref5$Link = _ref5.Link, Link$1 = _ref5$Link === void 0 ? Link : _ref5$Link, className = _ref5.className, restProps = _objectWithoutProperties(_ref5, _excluded4$1);
    var DefaultLinkComponent = Link$1;
    var LinkComponent = Link$1 || DefaultLinkComponent;
    return jsxRuntimeExports.jsx(BreadcrumbNavItem, {
      children: jsxRuntimeExports.jsxs(LinkComponent, _objectSpread$1e(_objectSpread$1e(_objectSpread$1e({
        className: clsx("utrecht-breadcrumb-nav__link", className, {
          "utrecht-breadcrumb-nav__link--current": current,
          "utrecht-breadcrumb-nav__link--disabled": disabled
        }),
        href: disabled ? void 0 : href,
        rel,
        role: role || (disabled ? "link" : void 0),
        "aria-current": current && "page",
        "aria-disabled": disabled ? "true" : void 0
      }, useMicrodataProp("item")), restProps), {}, {
        ref,
        children: [jsxRuntimeExports.jsx("span", _objectSpread$1e(_objectSpread$1e({
          className: "utrecht-breadcrumb-nav__text"
        }, useMicrodataProp("name")), {}, {
          children
        })), typeof index === "number" ? jsxRuntimeExports.jsx("meta", _objectSpread$1e(_objectSpread$1e({}, useMicrodataProp("position")), {}, {
          content: String(index + 1)
        })) : null]
      }))
    });
  });
  BreadcrumbNavLink.displayName = "BreadcrumbNavLink";
  var _excluded$1c = ["children", "className", "direction"];
  function ownKeys$1d(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread$1d(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys$1d(Object(t), true).forEach(function(r3) {
        _defineProperty(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$1d(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  var hasManyElements = function hasManyElements2(children) {
    return Array.isArray(children) && children.reduce(function(count, item) {
      return /* @__PURE__ */ reactExports.isValidElement(item) ? count + 1 : count;
    }, 0) >= 2;
  };
  var ButtonGroup = /* @__PURE__ */ reactExports.forwardRef(function(_ref, ref) {
    var children = _ref.children, className = _ref.className, direction = _ref.direction, restProps = _objectWithoutProperties(_ref, _excluded$1c);
    return jsxRuntimeExports.jsx("p", _objectSpread$1d(_objectSpread$1d({
      role: hasManyElements(children) ? "group" : void 0
    }, restProps), {}, {
      ref,
      className: clsx("utrecht-button-group", {
        "utrecht-button-group--column": direction === "column",
        "utrecht-button-group--row": direction === "row"
      }, className),
      children
    }));
  });
  ButtonGroup.displayName = "ButtonGroup";
  var _excluded$1b = ["appearance", "children", "className", "external", "href", "placeholder", "role"];
  function ownKeys$1c(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread$1c(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys$1c(Object(t), true).forEach(function(r3) {
        _defineProperty(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$1c(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  var onKeyDown = function onKeyDown2(evt) {
    var _evt$target;
    if (evt.key === " " && typeof ((_evt$target = evt.target) === null || _evt$target === void 0 ? void 0 : _evt$target.click) === "function") {
      evt.preventDefault();
      evt.target.click();
    }
  };
  var ButtonLink = /* @__PURE__ */ reactExports.forwardRef(function(_ref, ref) {
    var appearance = _ref.appearance, children = _ref.children, className = _ref.className, external = _ref.external, href = _ref.href, placeholder = _ref.placeholder, role = _ref.role, restProps = _objectWithoutProperties(_ref, _excluded$1b);
    var props = restProps;
    if (role === "button") {
      props = _objectSpread$1c(_objectSpread$1c({}, restProps), {}, {
        onKeyDown
      });
    }
    return jsxRuntimeExports.jsx("a", _objectSpread$1c(_objectSpread$1c({
      href: placeholder ? void 0 : href,
      ref,
      role: role || (placeholder ? "link" : void 0),
      className: clsx("utrecht-button-link", "utrecht-button-link--html-a", {
        "utrecht-button-link--external": external,
        "utrecht-button-link--primary-action": appearance === "primary-action-button",
        "utrecht-button-link--secondary-action": appearance === "secondary-action-button",
        "utrecht-button-link--subtle": appearance === "subtle-button",
        "utrecht-button-link--placeholder": placeholder
      }, className),
      rel: external ? "external noopener noreferrer" : void 0,
      "aria-disabled": placeholder ? "true" : void 0
    }, props), {}, {
      children
    }));
  });
  ButtonLink.displayName = "ButtonLink";
  var _excluded$1a = ["appearance", "disabled", "indeterminate", "invalid", "required", "className"];
  function ownKeys$1b(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread$1b(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys$1b(Object(t), true).forEach(function(r3) {
        _defineProperty(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$1b(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  var Checkbox = /* @__PURE__ */ reactExports.forwardRef(function(_ref, ref) {
    var _ref$appearance = _ref.appearance, appearance = _ref$appearance === void 0 ? "custom" : _ref$appearance, disabled = _ref.disabled, _ref$indeterminate = _ref.indeterminate, indeterminate = _ref$indeterminate === void 0 ? false : _ref$indeterminate, invalid = _ref.invalid, required = _ref.required, className = _ref.className, restProps = _objectWithoutProperties(_ref, _excluded$1a);
    var internalRef = reactExports.useRef(null);
    reactExports.useImperativeHandle(ref, function() {
      return internalRef.current;
    });
    reactExports.useEffect(function() {
      if (internalRef.current) {
        internalRef.current.indeterminate = indeterminate;
      }
    }, [indeterminate]);
    return jsxRuntimeExports.jsx("input", _objectSpread$1b(_objectSpread$1b({}, restProps), {}, {
      ref: internalRef,
      type: "checkbox",
      className: clsx("utrecht-checkbox", "utrecht-checkbox--html-input", {
        "utrecht-checkbox--disabled": disabled,
        "utrecht-checkbox--custom": appearance === "custom",
        "utrecht-checkbox--invalid": invalid,
        "utrecht-checkbox--indeterminate": indeterminate,
        "utrecht-checkbox--required": required
      }, className),
      "aria-checked": indeterminate ? "mixed" : void 0,
      "aria-invalid": invalid || void 0,
      disabled,
      required
    }));
  });
  Checkbox.displayName = "Checkbox";
  var _excluded$19 = ["children", "className"];
  function ownKeys$1a(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread$1a(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys$1a(Object(t), true).forEach(function(r3) {
        _defineProperty(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$1a(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  var Code = /* @__PURE__ */ reactExports.forwardRef(function(_ref, ref) {
    var children = _ref.children, className = _ref.className, restProps = _objectWithoutProperties(_ref, _excluded$19);
    return jsxRuntimeExports.jsx("code", _objectSpread$1a(_objectSpread$1a({
      ref,
      className: clsx("utrecht-code", className)
    }, restProps), {}, {
      children
    }));
  });
  Code.displayName = "Code";
  var _excluded$18 = ["children", "className"];
  function ownKeys$19(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread$19(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys$19(Object(t), true).forEach(function(r3) {
        _defineProperty(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$19(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  var CodeBlock = /* @__PURE__ */ reactExports.forwardRef(function(_ref, ref) {
    var children = _ref.children, className = _ref.className, restProps = _objectWithoutProperties(_ref, _excluded$18);
    return jsxRuntimeExports.jsx("pre", _objectSpread$19(_objectSpread$19({
      ref,
      className: clsx("utrecht-code-block", className)
    }, restProps), {}, {
      children: jsxRuntimeExports.jsx("code", {
        className: "utrecht-code-block__content",
        children
      })
    }));
  });
  CodeBlock.displayName = "CodeBlock";
  var _excluded$17 = ["children", "className", "color", "style"];
  function ownKeys$18(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread$18(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys$18(Object(t), true).forEach(function(r3) {
        _defineProperty(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$18(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  var ColorSample = /* @__PURE__ */ reactExports.forwardRef(function(_ref, ref) {
    var children = _ref.children, className = _ref.className, color = _ref.color, style = _ref.style, restProps = _objectWithoutProperties(_ref, _excluded$17);
    return jsxRuntimeExports.jsx("data", _objectSpread$18(_objectSpread$18({
      ref,
      className: clsx("utrecht-color-sample", className),
      style: _objectSpread$18(_objectSpread$18({}, style), {}, {
        color
      }),
      value: color
    }, restProps), {}, {
      children
    }));
  });
  ColorSample.displayName = "ColorSample";
  var ColumnLayout = /* @__PURE__ */ reactExports.forwardRef(function(_ref, ref) {
    var children = _ref.children, className = _ref.className, rule = _ref.rule;
    return jsxRuntimeExports.jsx("div", {
      className: clsx("utrecht-column-layout", {
        "utrecht-column-layout--rule": rule
      }, className),
      ref,
      children
    });
  });
  ColumnLayout.displayName = "ColumnLayout";
  var _excluded$16 = ["className"], _excluded2$7 = ["className", "position"];
  function ownKeys$17(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread$17(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys$17(Object(t), true).forEach(function(r3) {
        _defineProperty(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$17(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  var Combobox = /* @__PURE__ */ reactExports.forwardRef(function(_ref, ref) {
    var className = _ref.className, restProps = _objectWithoutProperties(_ref, _excluded$16);
    return jsxRuntimeExports.jsx("div", _objectSpread$17(_objectSpread$17({
      className: clsx("utrecht-combobox", className)
    }, restProps), {}, {
      ref
    }));
  });
  Combobox.displayName = "Combobox";
  var ComboboxPopover = /* @__PURE__ */ reactExports.forwardRef(function(_ref2, ref) {
    var className = _ref2.className, position = _ref2.position, restProps = _objectWithoutProperties(_ref2, _excluded2$7);
    return jsxRuntimeExports.jsx("div", _objectSpread$17(_objectSpread$17({
      className: clsx("utrecht-combobox__popover", {
        "utrecht-search-bar__popover--block-end": !position || position === "block-end"
      }, className)
    }, restProps), {}, {
      ref
    }));
  });
  ComboboxPopover.displayName = "ComboboxPopover";
  var _excluded$15 = ["children", "currency", "amount", "locale", "className"];
  function ownKeys$16(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread$16(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys$16(Object(t), true).forEach(function(r3) {
        _defineProperty(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$16(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  var formatLabel = function formatLabel2(locale, currency, amount) {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: Number.isInteger(amount) ? 0 : void 0,
      useGrouping: false
    }).format(amount).replace(/[\s]+/g, "").replace("-", "−");
  };
  var formatVisually = function formatVisually2(locale, currency, amount) {
    var formatted = new Intl.NumberFormat(locale, {
      style: "currency",
      currency
    }).format(amount);
    formatted = formatted.replace(/-/, "−");
    if ((locale === "nl" || locale === "nl-NL") && /\u2212/.test(formatted)) {
      formatted = formatted.replace(/(.+)\u2212(.+)/, "− $1$2");
    }
    formatted = formatted.replace(/ /g, " ");
    return formatted;
  };
  var CurrencyData = /* @__PURE__ */ reactExports.forwardRef(function(_ref, ref) {
    var children = _ref.children, _ref$currency = _ref.currency, currency = _ref$currency === void 0 ? "EUR" : _ref$currency, amount = _ref.amount, _ref$locale = _ref.locale, locale = _ref$locale === void 0 ? "nl-NL" : _ref$locale, className = _ref.className, restProps = _objectWithoutProperties(_ref, _excluded$15);
    var number = typeof amount === "string" ? parseFloat(amount) : amount;
    var labelFormatted = formatLabel(locale, currency, number);
    var visuallyFormatted = formatVisually(locale, currency, number);
    return jsxRuntimeExports.jsx("data", _objectSpread$16(_objectSpread$16({}, restProps), {}, {
      ref,
      value: "".concat(currency, " ").concat(amount),
      className: clsx("utrecht-currency-data", number < 0 && "utrecht-currency-data--negative", number > 0 && "utrecht-currency-data--positive", className),
      "aria-label": labelFormatted,
      children: children || visuallyFormatted
    }));
  });
  CurrencyData.displayName = "CurrencyData";
  var _excluded$14 = ["children", "className", "dateTime", "value"];
  function ownKeys$15(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread$15(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys$15(Object(t), true).forEach(function(r3) {
        _defineProperty(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$15(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  var DataBadge = /* @__PURE__ */ reactExports.forwardRef(function(_ref, ref) {
    var children = _ref.children, className = _ref.className, dateTime = _ref.dateTime, value = _ref.value, restProps = _objectWithoutProperties(_ref, _excluded$14);
    var props = _objectSpread$15({
      children,
      className: clsx("utrecht-badge-data", className)
    }, restProps);
    return typeof dateTime !== "undefined" ? jsxRuntimeExports.jsx("time", _objectSpread$15(_objectSpread$15({}, props), {}, {
      dateTime,
      ref
    })) : typeof value !== "undefined" ? jsxRuntimeExports.jsx("data", _objectSpread$15(_objectSpread$15({}, props), {}, {
      value,
      ref
    })) : jsxRuntimeExports.jsx("span", _objectSpread$15(_objectSpread$15({}, props), {}, {
      ref
    }));
  });
  DataBadge.displayName = "DataBadge";
  var _excluded$13 = ["children", "className"];
  function ownKeys$14(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread$14(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys$14(Object(t), true).forEach(function(r3) {
        _defineProperty(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$14(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  var Document = /* @__PURE__ */ reactExports.forwardRef(function(_ref, ref) {
    var children = _ref.children, className = _ref.className, restProps = _objectWithoutProperties(_ref, _excluded$13);
    return jsxRuntimeExports.jsx("div", _objectSpread$14(_objectSpread$14({}, restProps), {}, {
      ref,
      className: clsx("utrecht-document", className),
      children
    }));
  });
  Document.displayName = "Document";
  var _excluded$12 = ["appearance", "children", "className"], _excluded2$6 = ["children", "className"], _excluded3$1 = ["children", "className"], _excluded4 = ["children", "className"];
  function ownKeys$13(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread$13(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys$13(Object(t), true).forEach(function(r3) {
        _defineProperty(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$13(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  var DataList = /* @__PURE__ */ reactExports.forwardRef(function(_ref, ref) {
    var appearance = _ref.appearance, children = _ref.children, className = _ref.className, restProps = _objectWithoutProperties(_ref, _excluded$12);
    return jsxRuntimeExports.jsx("dl", _objectSpread$13(_objectSpread$13({}, restProps), {}, {
      className: clsx("utrecht-data-list", "utrecht-data-list--html-dl", appearance === "rows" && "utrecht-data-list--rows", className),
      ref,
      children
    }));
  });
  DataList.displayName = "DataList";
  var DataListItem = /* @__PURE__ */ reactExports.forwardRef(function(_ref2, ref) {
    var children = _ref2.children, className = _ref2.className, restProps = _objectWithoutProperties(_ref2, _excluded2$6);
    return jsxRuntimeExports.jsx("div", _objectSpread$13(_objectSpread$13({}, restProps), {}, {
      className: clsx("utrecht-data-list__item", className),
      ref,
      children
    }));
  });
  DataListItem.displayName = "DataListItem";
  var DataListKey = /* @__PURE__ */ reactExports.forwardRef(function(_ref3, ref) {
    var children = _ref3.children, className = _ref3.className, restProps = _objectWithoutProperties(_ref3, _excluded3$1);
    return jsxRuntimeExports.jsx("dt", _objectSpread$13(_objectSpread$13({}, restProps), {}, {
      className: clsx("utrecht-data-list__item-key", className),
      ref,
      children
    }));
  });
  DataListKey.displayName = "DataListKey";
  var DataListValue = /* @__PURE__ */ reactExports.forwardRef(function(_ref4, ref) {
    var value = _ref4.value, children = _ref4.children, className = _ref4.className, emptyDescription = _ref4.emptyDescription, multiline = _ref4.multiline, notranslate = _ref4.notranslate;
    var empty = value === "" || value === null;
    return jsxRuntimeExports.jsx("dd", {
      className: clsx("utrecht-data-list__item-value", "utrecht-data-list__item-value--html-dd", className, multiline && "utrecht-data-list__item-value--multiline"),
      translate: typeof notranslate === "boolean" ? notranslate ? "no" : "yes" : void 0,
      ref,
      children: empty ? jsxRuntimeExports.jsx("span", {
        "aria-label": emptyDescription,
        children: "-"
      }) : children
    });
  });
  DataListValue.displayName = "DataListValue";
  var DataListActions = /* @__PURE__ */ reactExports.forwardRef(function(_ref5, ref) {
    var children = _ref5.children, className = _ref5.className, restProps = _objectWithoutProperties(_ref5, _excluded4);
    return jsxRuntimeExports.jsx("dd", _objectSpread$13(_objectSpread$13({}, restProps), {}, {
      className: clsx("utrecht-data-list__actions", "utrecht-data-list__actions--html-dd", className),
      ref,
      children
    }));
  });
  DataListActions.displayName = "DataListActions";
  var _excluded$11 = ["align", "children", "className", "modal"];
  function ownKeys$12(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread$12(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys$12(Object(t), true).forEach(function(r3) {
        _defineProperty(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$12(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  var Drawer = /* @__PURE__ */ reactExports.forwardRef(function(_ref, ref) {
    var align = _ref.align, children = _ref.children, className = _ref.className, modal = _ref.modal, restProps = _objectWithoutProperties(_ref, _excluded$11);
    var dialogRef = reactExports.useRef(null);
    reactExports.useImperativeHandle(ref, function() {
      return dialogRef.current;
    });
    reactExports.useEffect(function() {
      if (modal && restProps.open && dialogRef !== null && dialogRef !== void 0 && dialogRef.current) {
        dialogRef.current.close();
        dialogRef.current.showModal();
      }
    });
    return jsxRuntimeExports.jsx("dialog", _objectSpread$12(_objectSpread$12({}, restProps), {}, {
      ref: dialogRef,
      className: clsx("utrecht-drawer", {
        "utrecht-drawer--block-end": align === "block-end",
        "utrecht-drawer--block-start": align === "block-start",
        "utrecht-drawer--inline-end": align === "inline-end",
        "utrecht-drawer--inline-start": align === "inline-start" || !align
      }, className),
      children
    }));
  });
  Drawer.displayName = "Drawer";
  var _excluded$10 = ["children", "className"];
  function ownKeys$11(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread$11(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys$11(Object(t), true).forEach(function(r3) {
        _defineProperty(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$11(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  var Emphasis = /* @__PURE__ */ reactExports.forwardRef(function(_ref, ref) {
    var children = _ref.children, className = _ref.className, restProps = _objectWithoutProperties(_ref, _excluded$10);
    return jsxRuntimeExports.jsx("em", _objectSpread$11(_objectSpread$11({
      ref,
      className: clsx("utrecht-emphasis", "utrecht-emphasis--stressed", className)
    }, restProps), {}, {
      children
    }));
  });
  Emphasis.displayName = "Emphasis";
  var _excluded$$ = ["aria-describedby", "aria-label", "aria-labelledby", "className", "children", "disabled", "form", "invalid", "name", "role"], _excluded2$5 = ["className", "children", "disabled", "invalid"];
  function ownKeys$10(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread$10(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys$10(Object(t), true).forEach(function(r3) {
        _defineProperty(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$10(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  var Fieldset = /* @__PURE__ */ reactExports.forwardRef(function(_ref, ref) {
    var ariaDescribedby = _ref["aria-describedby"], ariaLabel = _ref["aria-label"], ariaLabelledby = _ref["aria-labelledby"], className = _ref.className, children = _ref.children, disabled = _ref.disabled, form = _ref.form, invalid = _ref.invalid, name = _ref.name, role = _ref.role, restProps = _objectWithoutProperties(_ref, _excluded$$);
    return jsxRuntimeExports.jsx("div", _objectSpread$10(_objectSpread$10({}, restProps), {}, {
      ref,
      className: clsx("utrecht-form-fieldset", disabled && "utrecht-form-fieldset--disabled", invalid && "utrecht-form-fieldset--invalid", className),
      children: jsxRuntimeExports.jsx("fieldset", {
        "aria-describedby": ariaDescribedby,
        "aria-label": ariaLabel,
        "aria-labelledby": ariaLabelledby,
        "aria-invalid": invalid || void 0,
        disabled,
        form,
        name,
        role,
        className: clsx("utrecht-form-fieldset__fieldset", "utrecht-form-fieldset--html-fieldset"),
        children
      })
    }));
  });
  Fieldset.displayName = "Fieldset";
  var FieldsetOnly = /* @__PURE__ */ reactExports.forwardRef(function(_ref2, ref) {
    var className = _ref2.className, children = _ref2.children, disabled = _ref2.disabled, invalid = _ref2.invalid, restProps = _objectWithoutProperties(_ref2, _excluded2$5);
    return jsxRuntimeExports.jsx("fieldset", _objectSpread$10(_objectSpread$10({}, restProps), {}, {
      ref,
      "aria-invalid": invalid || void 0,
      disabled,
      className: clsx("utrecht-form-fieldset", "utrecht-form-fieldset--html-fieldset", disabled && "utrecht-form-fieldset--disabled", invalid && "utrecht-form-fieldset--invalid", className),
      children
    }));
  });
  FieldsetOnly.displayName = "Fieldset";
  var _excluded$_ = ["className", "children"];
  function ownKeys$$(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread$$(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys$$(Object(t), true).forEach(function(r3) {
        _defineProperty(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$$(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  var FieldsetLegend = /* @__PURE__ */ reactExports.forwardRef(function(_ref, ref) {
    var className = _ref.className, children = _ref.children, restProps = _objectWithoutProperties(_ref, _excluded$_);
    return jsxRuntimeExports.jsx("legend", _objectSpread$$(_objectSpread$$({}, restProps), {}, {
      ref,
      className: clsx("utrecht-form-fieldset__legend", "utrecht-form-fieldset__legend--html-legend", className),
      children
    }));
  });
  FieldsetLegend.displayName = "FieldsetLegend";
  var _excluded$Z = ["className", "children"];
  function ownKeys$_(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread$_(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys$_(Object(t), true).forEach(function(r3) {
        _defineProperty(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$_(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  var Figure = /* @__PURE__ */ reactExports.forwardRef(function(_ref, ref) {
    var className = _ref.className, children = _ref.children, restProps = _objectWithoutProperties(_ref, _excluded$Z);
    return jsxRuntimeExports.jsx("figure", _objectSpread$_(_objectSpread$_({}, restProps), {}, {
      ref,
      className: clsx("utrecht-figure", className),
      children
    }));
  });
  Figure.displayName = "Figure";
  var _excluded$Y = ["className", "children"];
  function ownKeys$Z(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread$Z(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys$Z(Object(t), true).forEach(function(r3) {
        _defineProperty(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$Z(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  var FigureCaption = /* @__PURE__ */ reactExports.forwardRef(function(_ref, ref) {
    var className = _ref.className, children = _ref.children, restProps = _objectWithoutProperties(_ref, _excluded$Y);
    return jsxRuntimeExports.jsx("figcaption", _objectSpread$Z(_objectSpread$Z({}, restProps), {}, {
      ref,
      className: clsx("utrecht-figure__caption", className),
      children
    }));
  });
  FigureCaption.displayName = "FigureCaption";
  var _excluded$X = ["className", "children", "description", "input", "invalid", "label", "type"];
  function ownKeys$Y(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread$Y(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys$Y(Object(t), true).forEach(function(r3) {
        _defineProperty(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$Y(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  var FormField = /* @__PURE__ */ reactExports.forwardRef(function(_ref, ref) {
    var className = _ref.className, children = _ref.children, description = _ref.description, input = _ref.input, invalid = _ref.invalid, label = _ref.label, type = _ref.type, restProps = _objectWithoutProperties(_ref, _excluded$X);
    return jsxRuntimeExports.jsxs("div", _objectSpread$Y(_objectSpread$Y({}, restProps), {}, {
      ref,
      className: clsx("utrecht-form-field", {
        "utrecht-form-field--invalid": invalid,
        "utrecht-form-field--checkbox": type === "checkbox",
        "utrecht-form-field--radio": type === "radio",
        "utrecht-form-field--text": !type || type === "text"
      }, className),
      children: [label && jsxRuntimeExports.jsx("div", {
        className: "utrecht-form-field__label",
        children: label
      }), input && jsxRuntimeExports.jsx("div", {
        className: "utrecht-form-field__input",
        children: input
      }), description && jsxRuntimeExports.jsx("div", {
        className: "utrecht-form-field__description",
        children: description
      }), children]
    }));
  });
  FormField.displayName = "FormField";
  var _excluded$W = ["invalid", "valid", "warning", "className", "children"];
  function ownKeys$X(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread$X(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys$X(Object(t), true).forEach(function(r3) {
        _defineProperty(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$X(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  var FormFieldDescription = /* @__PURE__ */ reactExports.forwardRef(function(_ref, ref) {
    var invalid = _ref.invalid, valid = _ref.valid, warning = _ref.warning, className = _ref.className, children = _ref.children, restProps = _objectWithoutProperties(_ref, _excluded$W);
    return jsxRuntimeExports.jsx("div", _objectSpread$X(_objectSpread$X({}, restProps), {}, {
      ref,
      className: clsx("utrecht-form-field-description", invalid && "utrecht-form-field-description--invalid", valid && "utrecht-form-field-description--valid", warning && "utrecht-form-field-description--warning", className),
      children
    }));
  });
  FormFieldDescription.displayName = "FormFieldDescription";
  var _excluded$V = ["className", "children"];
  function ownKeys$W(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread$W(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys$W(Object(t), true).forEach(function(r3) {
        _defineProperty(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$W(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  var FormFieldErrorMessage = /* @__PURE__ */ reactExports.forwardRef(function(_ref, ref) {
    var className = _ref.className, children = _ref.children, restProps = _objectWithoutProperties(_ref, _excluded$V);
    return jsxRuntimeExports.jsx("div", _objectSpread$W(_objectSpread$W({}, restProps), {}, {
      ref,
      className: clsx("utrecht-form-field-error-message", className),
      children
    }));
  });
  FormFieldErrorMessage.displayName = "FormFieldErrorMessage";
  var _excluded$U = ["children", "className", "type", "disabled", "checked"];
  function ownKeys$V(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread$V(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys$V(Object(t), true).forEach(function(r3) {
        _defineProperty(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$V(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  var FormLabel = /* @__PURE__ */ reactExports.forwardRef(function(_ref, ref) {
    var children = _ref.children, className = _ref.className, type = _ref.type, disabled = _ref.disabled, checked = _ref.checked, restProps = _objectWithoutProperties(_ref, _excluded$U);
    return jsxRuntimeExports.jsx("label", _objectSpread$V(_objectSpread$V({}, restProps), {}, {
      ref,
      className: clsx("utrecht-form-label", type && "utrecht-form-label--".concat(type), disabled && "utrecht-form-label--disabled", checked && "utrecht-form-label--checked", className),
      children
    }));
  });
  FormLabel.displayName = "FormLabel";
  var _excluded$T = ["dir", "disabled", "invalid", "readOnly", "required", "inputRequired", "className", "type", "inputMode"];
  function ownKeys$U(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread$U(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys$U(Object(t), true).forEach(function(r3) {
        _defineProperty(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$U(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  var Textbox = /* @__PURE__ */ reactExports.forwardRef(function(_ref, ref) {
    var dir = _ref.dir, disabled = _ref.disabled, invalid = _ref.invalid, readOnly = _ref.readOnly, required = _ref.required, inputRequired = _ref.inputRequired, className = _ref.className, _ref$type = _ref.type, type = _ref$type === void 0 ? "text" : _ref$type, inputMode = _ref.inputMode, restProps = _objectWithoutProperties(_ref, _excluded$T);
    return jsxRuntimeExports.jsx("input", _objectSpread$U(_objectSpread$U({}, restProps), {}, {
      ref,
      type,
      className: clsx("utrecht-textbox", "utrecht-textbox--html-input", disabled && "utrecht-textbox--disabled", invalid && "utrecht-textbox--invalid", readOnly && "utrecht-textbox--readonly", (required || inputRequired) && "utrecht-textbox--required", className),
      dir: dir !== null && dir !== void 0 ? dir : "auto",
      disabled,
      readOnly,
      "aria-required": required ? required : void 0,
      required: inputRequired,
      "aria-invalid": invalid || void 0,
      inputMode: inputMode || (type === "number" ? "numeric" : void 0)
    }));
  });
  Textbox.displayName = "Textbox";
  var _excluded$S = ["name", "invalid", "disabled", "label", "errorMessage", "description", "readOnly", "status", "autoComplete", "list", "min", "max", "minLength", "maxLength", "step", "placeholder", "pattern", "required", "inputRequired", "inputDir", "type", "value", "onChange", "onInput", "onFocus", "onBlur", "defaultValue", "size", "children", "inputRef"];
  function ownKeys$T(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread$T(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys$T(Object(t), true).forEach(function(r3) {
        _defineProperty(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$T(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  var FormFieldTextbox = /* @__PURE__ */ reactExports.forwardRef(function(_ref, ref) {
    var name = _ref.name, invalid = _ref.invalid, disabled = _ref.disabled, label = _ref.label, errorMessage = _ref.errorMessage, description = _ref.description, readOnly = _ref.readOnly, status = _ref.status, autoComplete = _ref.autoComplete, list = _ref.list, min = _ref.min, max = _ref.max, minLength = _ref.minLength, maxLength = _ref.maxLength, step = _ref.step, placeholder = _ref.placeholder, pattern = _ref.pattern, required = _ref.required, inputRequired = _ref.inputRequired, inputDir = _ref.inputDir, type = _ref.type, value = _ref.value, onChange = _ref.onChange, onInput = _ref.onInput, onFocus = _ref.onFocus, onBlur = _ref.onBlur, defaultValue = _ref.defaultValue, size = _ref.size, children = _ref.children, inputRef = _ref.inputRef, props = _objectWithoutProperties(_ref, _excluded$S);
    var inputId = reactExports.useId();
    var descriptionId = reactExports.useId();
    var statusId = reactExports.useId();
    var errorMessageId = reactExports.useId();
    return jsxRuntimeExports.jsxs(FormField, _objectSpread$T(_objectSpread$T({
      invalid,
      ref
    }, props), {}, {
      children: [jsxRuntimeExports.jsx("div", {
        className: "utrecht-form-field__label",
        children: jsxRuntimeExports.jsx(FormLabel, {
          htmlFor: inputId,
          children: label
        })
      }), description && jsxRuntimeExports.jsx(FormFieldDescription, {
        className: "utrecht-form-field__description",
        id: descriptionId,
        children: description
      }), invalid && errorMessage && jsxRuntimeExports.jsx(FormFieldErrorMessage, {
        className: "utrecht-form-field__error-message",
        id: errorMessageId,
        children: errorMessage
      }), jsxRuntimeExports.jsx("div", {
        className: "utrecht-form-field__input",
        children: jsxRuntimeExports.jsx(Textbox, {
          ref: inputRef,
          id: inputId,
          name,
          type: type || "text",
          autoComplete,
          "aria-describedby": clsx(_defineProperty(_defineProperty(_defineProperty({}, descriptionId, description), errorMessageId, invalid), statusId, status)) || void 0,
          invalid,
          dir: inputDir || "auto",
          disabled,
          min,
          max,
          minLength,
          maxLength,
          pattern,
          placeholder,
          readOnly,
          required,
          inputRequired,
          value,
          onFocus,
          onBlur,
          onInput,
          onChange,
          defaultValue,
          list,
          size,
          step
        })
      }), status && jsxRuntimeExports.jsx("div", {
        className: "utrecht-form-field__status",
        id: statusId,
        children: status
      }), children]
    }));
  });
  FormFieldTextbox.displayName = "FormFieldTextbox";
  var _excluded$R = ["checked", "disabled", "invalid", "id", "hidden", "required", "role", "tabIndex", "className"];
  function ownKeys$S(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread$S(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys$S(Object(t), true).forEach(function(r3) {
        _defineProperty(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$S(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  var FormToggle = /* @__PURE__ */ reactExports.forwardRef(function(_ref, ref) {
    var checked = _ref.checked, disabled = _ref.disabled, invalid = _ref.invalid, id = _ref.id, hidden = _ref.hidden, required = _ref.required, role = _ref.role, tabIndex = _ref.tabIndex, className = _ref.className, restProps = _objectWithoutProperties(_ref, _excluded$R);
    return jsxRuntimeExports.jsxs("div", {
      className: clsx("utrecht-form-toggle", "utrecht-form-toggle--html-checkbox", {
        "utrecht-form-toggle--disabled": disabled,
        "utrecht-form-toggle--invalid": invalid,
        "utrecht-form-toggle--required": required
      }, className),
      hidden,
      children: [jsxRuntimeExports.jsx("input", _objectSpread$S({
        id,
        "aria-invalid": invalid || void 0,
        type: "checkbox",
        className: "utrecht-form-toggle__checkbox",
        defaultChecked: checked || void 0,
        disabled: disabled || void 0,
        required,
        ref,
        role,
        tabIndex
      }, restProps)), jsxRuntimeExports.jsx("label", {
        htmlFor: id,
        className: clsx("utrecht-form-toggle__track", "utrecht-form-toggle__track--html-label"),
        children: jsxRuntimeExports.jsx("div", {
          className: "utrecht-form-toggle__thumb"
        })
      })]
    });
  });
  FormToggle.displayName = "FormToggle";
  var _excluded$Q = ["children", "className"];
  function ownKeys$R(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread$R(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys$R(Object(t), true).forEach(function(r3) {
        _defineProperty(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$R(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  var HTMLContent = /* @__PURE__ */ reactExports.forwardRef(function(_ref, ref) {
    var children = _ref.children, className = _ref.className, restProps = _objectWithoutProperties(_ref, _excluded$Q);
    return jsxRuntimeExports.jsx("div", _objectSpread$R(_objectSpread$R({}, restProps), {}, {
      ref,
      className: clsx("utrecht-html", className),
      children
    }));
  });
  HTMLContent.displayName = "HTMLContent";
  var _excluded$P = ["children", "className"];
  function ownKeys$Q(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread$Q(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys$Q(Object(t), true).forEach(function(r3) {
        _defineProperty(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$Q(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  var Heading1 = /* @__PURE__ */ reactExports.forwardRef(function(_ref, ref) {
    var children = _ref.children, className = _ref.className, restProps = _objectWithoutProperties(_ref, _excluded$P);
    return jsxRuntimeExports.jsx("h1", _objectSpread$Q(_objectSpread$Q({}, restProps), {}, {
      ref,
      className: clsx("utrecht-heading-1", className),
      children
    }));
  });
  Heading1.displayName = "Heading1";
  var _excluded$O = ["children", "className"];
  function ownKeys$P(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread$P(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys$P(Object(t), true).forEach(function(r3) {
        _defineProperty(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$P(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  var Heading2 = /* @__PURE__ */ reactExports.forwardRef(function(_ref, ref) {
    var children = _ref.children, className = _ref.className, restProps = _objectWithoutProperties(_ref, _excluded$O);
    return jsxRuntimeExports.jsx("h2", _objectSpread$P(_objectSpread$P({}, restProps), {}, {
      ref,
      className: clsx("utrecht-heading-2", className),
      children
    }));
  });
  Heading2.displayName = "Heading2";
  var _excluded$N = ["children", "className"];
  function ownKeys$O(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread$O(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys$O(Object(t), true).forEach(function(r3) {
        _defineProperty(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$O(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  var Heading3 = /* @__PURE__ */ reactExports.forwardRef(function(_ref, ref) {
    var children = _ref.children, className = _ref.className, restProps = _objectWithoutProperties(_ref, _excluded$N);
    return jsxRuntimeExports.jsx("h3", _objectSpread$O(_objectSpread$O({}, restProps), {}, {
      ref,
      className: clsx("utrecht-heading-3", className),
      children
    }));
  });
  Heading3.displayName = "Heading3";
  var _excluded$M = ["children", "className"];
  function ownKeys$N(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread$N(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys$N(Object(t), true).forEach(function(r3) {
        _defineProperty(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$N(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  var Heading4 = /* @__PURE__ */ reactExports.forwardRef(function(_ref, ref) {
    var children = _ref.children, className = _ref.className, restProps = _objectWithoutProperties(_ref, _excluded$M);
    return jsxRuntimeExports.jsx("h4", _objectSpread$N(_objectSpread$N({}, restProps), {}, {
      ref,
      className: clsx("utrecht-heading-4", className),
      children
    }));
  });
  Heading4.displayName = "Heading4";
  var _excluded$L = ["children", "className"];
  function ownKeys$M(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread$M(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys$M(Object(t), true).forEach(function(r3) {
        _defineProperty(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$M(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  var Heading5 = /* @__PURE__ */ reactExports.forwardRef(function(_ref, ref) {
    var children = _ref.children, className = _ref.className, restProps = _objectWithoutProperties(_ref, _excluded$L);
    return jsxRuntimeExports.jsx("h5", _objectSpread$M(_objectSpread$M({}, restProps), {}, {
      ref,
      className: clsx("utrecht-heading-5", className),
      children
    }));
  });
  Heading5.displayName = "Heading5";
  var _excluded$K = ["children", "className"];
  function ownKeys$L(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread$L(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys$L(Object(t), true).forEach(function(r3) {
        _defineProperty(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$L(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  var Heading6 = /* @__PURE__ */ reactExports.forwardRef(function(_ref, ref) {
    var children = _ref.children, className = _ref.className, restProps = _objectWithoutProperties(_ref, _excluded$K);
    return jsxRuntimeExports.jsx("h6", _objectSpread$L(_objectSpread$L({}, restProps), {}, {
      ref,
      className: clsx("utrecht-heading-6", className),
      children
    }));
  });
  Heading6.displayName = "Heading6";
  var _excluded$J = ["children", "className"];
  function ownKeys$K(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread$K(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys$K(Object(t), true).forEach(function(r3) {
        _defineProperty(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$K(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  var HeadingGroup = /* @__PURE__ */ reactExports.forwardRef(function(_ref, ref) {
    var children = _ref.children, className = _ref.className, restProps = _objectWithoutProperties(_ref, _excluded$J);
    return jsxRuntimeExports.jsx("hgroup", _objectSpread$K(_objectSpread$K({}, restProps), {}, {
      ref,
      className: clsx("utrecht-heading-group", className),
      children
    }));
  });
  HeadingGroup.displayName = "HeadingGroup";
  var _excluded$I = ["children", "value", "className"];
  function ownKeys$J(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread$J(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys$J(Object(t), true).forEach(function(r3) {
        _defineProperty(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$J(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  var normalizeIBAN = function normalizeIBAN2(iban) {
    return iban.replace(/[\s+\W]+/g, "").toUpperCase();
  };
  var formatIBAN = function formatIBAN2(normalizedIBAN) {
    return normalizedIBAN.replace(/(.{4})(?!$)/g, "$1 ");
  };
  var IBANData = /* @__PURE__ */ reactExports.forwardRef(function(_ref, ref) {
    var children = _ref.children, value = _ref.value, className = _ref.className, restProps = _objectWithoutProperties(_ref, _excluded$I);
    var normalized = normalizeIBAN(value);
    var formatted = formatIBAN(normalized);
    return jsxRuntimeExports.jsx("data", _objectSpread$J(_objectSpread$J({}, restProps), {}, {
      ref,
      value: normalized,
      className: clsx("utrecht-iban-data", className),
      translate: "no",
      children: children || formatted
    }));
  });
  IBANData.displayName = "IBANData";
  var _excluded$H = ["children", "className"];
  function ownKeys$I(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread$I(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys$I(Object(t), true).forEach(function(r3) {
        _defineProperty(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$I(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  var Icon = /* @__PURE__ */ reactExports.forwardRef(function(_ref, ref) {
    var children = _ref.children, className = _ref.className, restProps = _objectWithoutProperties(_ref, _excluded$H);
    return jsxRuntimeExports.jsx("span", _objectSpread$I(_objectSpread$I({
      "aria-hidden": "true",
      ref,
      className: clsx("utrecht-icon", className)
    }, restProps), {}, {
      children
    }));
  });
  Icon.displayName = "Icon";
  var _excluded$G = ["component", "currentChar", "characters", "onLinkClick", "Link"];
  function ownKeys$H(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread$H(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys$H(Object(t), true).forEach(function(r3) {
        _defineProperty(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$H(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  var IndexCharNav = /* @__PURE__ */ reactExports.forwardRef(function(_ref, ref) {
    var component = _ref.component, currentChar = _ref.currentChar, characters = _ref.characters, onLinkClick = _ref.onLinkClick, Link2 = _ref.Link, restProps = _objectWithoutProperties(_ref, _excluded$G);
    var LinkComponent = Link2 ? Link2 : ButtonLink;
    var links = [];
    if (component === "button") {
      links = characters.map(function(_ref2) {
        var _char = _ref2["char"], disabled = _ref2.disabled;
        var current = currentChar === _char;
        return /* @__PURE__ */ reactExports.createElement(Button, _objectSpread$H(_objectSpread$H({}, restProps), {}, {
          className: clsx({
            "utrecht-index-char-nav__link--current": current
          }),
          ref,
          key: _char,
          appearance: current ? "primary-action-button" : "secondary-action-button",
          disabled,
          onClick: function onClick() {
            return typeof onLinkClick === "function" && onLinkClick(_char);
          },
          pressed: current
        }), _char);
      });
    } else {
      links = characters.map(function(_ref3) {
        var _char2 = _ref3["char"], disabled = _ref3.disabled, href = _ref3.href;
        var current = currentChar === _char2;
        var customLinkComponentStyle = clsx("utrecht-button-link", "utrecht-button-link--html-a", "utrecht-index-char-nav__link", {
          "utrecht-index-char-nav__link--current": current,
          "utrecht-button-link--primary-action": current,
          "utrecht-button-link--secondary-action": !current,
          "utrecht-index-char-nav__link--disabled": disabled,
          "utrecht-button-link--placeholder": disabled
        });
        return jsxRuntimeExports.jsx(LinkComponent, _objectSpread$H(_objectSpread$H({
          ref,
          appearance: Link2 ? void 0 : current ? "primary-action-button" : "secondary-action-button",
          href,
          className: clsx(Link2 && customLinkComponentStyle, "utrecht-index-char-nav__link", {
            "utrecht-index-char-nav__link--disabled": disabled,
            "utrecht-index-char-nav__link--current": current
          }),
          "aria-current": current ? "page" : void 0,
          "aria-disabled": disabled,
          placeholder: Link2 ? void 0 : disabled,
          onClick: function onClick() {
            return typeof onLinkClick === "function" && onLinkClick(_char2);
          }
        }, restProps), {}, {
          children: _char2
        }), _char2);
      });
    }
    return jsxRuntimeExports.jsx("div", {
      className: "utrecht-index-char-nav",
      role: "group",
      children: links
    });
  });
  IndexCharNav.displayName = "IndexCharNav";
  var _excluded$F = ["className", "photo"];
  function ownKeys$G(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread$G(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys$G(Object(t), true).forEach(function(r3) {
        _defineProperty(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$G(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  var Image = /* @__PURE__ */ reactExports.forwardRef(function(_ref, ref) {
    var className = _ref.className, photo = _ref.photo, restProps = _objectWithoutProperties(_ref, _excluded$F);
    return jsxRuntimeExports.jsx("img", _objectSpread$G(_objectSpread$G({}, restProps), {}, {
      ref,
      className: clsx("utrecht-img", {
        "utrecht-img--photo": photo
      }, className)
    }));
  });
  Image.displayName = "Image";
  var _excluded$E = ["children", "disabled", "inline", "className", "pressed", "type"];
  function ownKeys$F(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread$F(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys$F(Object(t), true).forEach(function(r3) {
        _defineProperty(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$F(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  var LinkButton = /* @__PURE__ */ reactExports.forwardRef(function(_ref, ref) {
    var children = _ref.children, disabled = _ref.disabled, inline = _ref.inline, className = _ref.className, pressed = _ref.pressed, type = _ref.type, restProps = _objectWithoutProperties(_ref, _excluded$E);
    return jsxRuntimeExports.jsx("button", _objectSpread$F(_objectSpread$F({
      ref,
      "aria-pressed": typeof pressed === "boolean" ? pressed : void 0,
      className: clsx("utrecht-link-button", "utrecht-link-button--html-button", {
        "utrecht-link-button--disabled": disabled,
        "utrecht-link-button--inline": inline,
        "utrecht-link-button--pressed": pressed
      }, className),
      disabled,
      type: type || "button"
    }, restProps), {}, {
      children
    }));
  });
  LinkButton.displayName = "LinkButton";
  var _excluded$D = ["children", "className", "external"];
  function ownKeys$E(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread$E(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys$E(Object(t), true).forEach(function(r3) {
        _defineProperty(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$E(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  var LinkSocial = /* @__PURE__ */ reactExports.forwardRef(function(_ref, ref) {
    var children = _ref.children, className = _ref.className, external = _ref.external, restProps = _objectWithoutProperties(_ref, _excluded$D);
    return jsxRuntimeExports.jsx("a", _objectSpread$E(_objectSpread$E({}, restProps), {}, {
      ref,
      className: clsx("utrecht-link-social", className),
      rel: external !== false ? "external noopener noreferrer" : void 0,
      children
    }));
  });
  LinkSocial.displayName = "LinkSocial";
  var _excluded$C = ["className", "icon", "children"], _excluded2$4 = ["children", "icon", "links", "className"];
  function ownKeys$D(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread$D(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys$D(Object(t), true).forEach(function(r3) {
        _defineProperty(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$D(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  var LinkListLink = /* @__PURE__ */ reactExports.forwardRef(function(_ref, ref) {
    var className = _ref.className, icon = _ref.icon, children = _ref.children, restProps = _objectWithoutProperties(_ref, _excluded$C);
    return jsxRuntimeExports.jsx("li", {
      className: clsx("utrecht-link-list__item", className),
      children: jsxRuntimeExports.jsxs(Link, _objectSpread$D(_objectSpread$D({
        className: "utrecht-link-list__link"
      }, restProps), {}, {
        ref,
        children: [icon, jsxRuntimeExports.jsx("span", {
          className: "utrecht-link-list__link-text",
          children
        })]
      }))
    });
  });
  LinkListLink.displayName = "LinkListLink";
  var LinkList = /* @__PURE__ */ reactExports.forwardRef(function(_ref2, ref) {
    var children = _ref2.children, icon = _ref2.icon, links = _ref2.links, className = _ref2.className, restProps = _objectWithoutProperties(_ref2, _excluded2$4);
    return jsxRuntimeExports.jsxs("ul", _objectSpread$D(_objectSpread$D({
      role: "list",
      ref,
      className: clsx("utrecht-link-list", "utrecht-link-list--html-ul", className)
    }, restProps), {}, {
      children: [children, Array.isArray(links) && links.map(function(linkProps, index) {
        return jsxRuntimeExports.jsx(LinkListLink, _objectSpread$D({
          icon: typeof icon === "function" ? icon() : void 0
        }, linkProps), index);
      })]
    }));
  });
  LinkList.displayName = "LinkList";
  var _excluded$B = ["children", "className", "disabled", "invalid", "multiple", "readOnly", "required"], _excluded2$3 = ["children", "label"], _excluded3 = ["active", "className", "disabled", "selected"];
  function ownKeys$C(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread$C(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys$C(Object(t), true).forEach(function(r3) {
        _defineProperty(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$C(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  var Listbox = /* @__PURE__ */ reactExports.forwardRef(function(_ref, ref) {
    var children = _ref.children, className = _ref.className, disabled = _ref.disabled, invalid = _ref.invalid, multiple = _ref.multiple, readOnly = _ref.readOnly, required = _ref.required, restProps = _objectWithoutProperties(_ref, _excluded$B);
    return jsxRuntimeExports.jsx("div", _objectSpread$C(_objectSpread$C({
      className: clsx("utrecht-listbox", "utrecht-listbox--html-div", {
        "utrecht-listbox--disabled": disabled,
        "utrecht-listbox--invalid": invalid,
        "utrecht-listbox--read-only": readOnly
      }, className),
      role: "listbox",
      "aria-disabled": disabled || void 0,
      "aria-invalid": invalid || void 0,
      "aria-multiselectable": multiple || void 0,
      "aria-readonly": readOnly || void 0,
      "aria-required": required || void 0,
      tabIndex: 0
    }, restProps), {}, {
      ref,
      children: jsxRuntimeExports.jsx("ul", {
        className: "utrecht-listbox__list",
        children
      })
    }));
  });
  Listbox.displayName = "Listbox";
  var ListboxOptionGroup = /* @__PURE__ */ reactExports.forwardRef(function(_ref2, ref) {
    var children = _ref2.children, label = _ref2.label, restProps = _objectWithoutProperties(_ref2, _excluded2$3);
    var id = reactExports.useId();
    return jsxRuntimeExports.jsxs("li", _objectSpread$C(_objectSpread$C({
      className: "utrecht-listbox__group",
      role: "group",
      "aria-labelledby": id
    }, restProps), {}, {
      ref,
      children: [label && jsxRuntimeExports.jsx("div", {
        id,
        className: "utrecht-listbox__group-label",
        children: label
      }), jsxRuntimeExports.jsx("ul", {
        children
      })]
    }));
  });
  ListboxOptionGroup.displayName = "ListboxOptionGroup";
  var ListboxOption = /* @__PURE__ */ reactExports.forwardRef(function(_ref3, ref) {
    var active = _ref3.active, className = _ref3.className, disabled = _ref3.disabled, selected = _ref3.selected, restProps = _objectWithoutProperties(_ref3, _excluded3);
    return jsxRuntimeExports.jsx("li", _objectSpread$C(_objectSpread$C({
      className: clsx("utrecht-listbox__option", "utrecht-listbox__option--html-li", {
        "utrecht-listbox__option--active": active,
        "utrecht-listbox__option--disabled": disabled,
        "utrecht-listbox__option--selected": selected
      }, className),
      "aria-disabled": disabled || void 0,
      "aria-selected": selected ? "true" : "false",
      tabIndex: disabled ? void 0 : -1,
      role: "option"
    }, restProps), {}, {
      ref
    }));
  });
  ListboxOption.displayName = "ListboxOption";
  var _excluded$A = ["children", "className"];
  function ownKeys$B(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread$B(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys$B(Object(t), true).forEach(function(r3) {
        _defineProperty(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$B(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  var Logo = /* @__PURE__ */ reactExports.forwardRef(function(_ref, ref) {
    var children = _ref.children, className = _ref.className, restProps = _objectWithoutProperties(_ref, _excluded$A);
    return jsxRuntimeExports.jsx("div", _objectSpread$B(_objectSpread$B({
      ref,
      className: clsx("utrecht-logo", className)
    }, restProps), {}, {
      children
    }));
  });
  Logo.displayName = "Logo";
  function ownKeys$A(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread$A(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys$A(Object(t), true).forEach(function(r3) {
        _defineProperty(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$A(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  var LogoImage = /* @__PURE__ */ reactExports.forwardRef(function(_ref, ref) {
    var restProps = _extends({}, (_objectDestructuringEmpty(_ref), _ref));
    return jsxRuntimeExports.jsxs("svg", _objectSpread$A(_objectSpread$A({
      width: "192",
      height: "100",
      viewBox: "0 0 192 100",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      ref
    }, restProps), {}, {
      children: [jsxRuntimeExports.jsxs("g", {
        clipPath: "url(#clip0_908_6292)",
        children: [jsxRuntimeExports.jsx("path", {
          d: "M124.75 61.3114C126.41 60.4985 127.932 59.5127 129.264 58.3712C129.558 57.9561 129.887 57.6448 130.267 57.4373C132.844 54.8084 134.453 51.4013 134.453 47.2331C134.453 47.2331 134.453 44.2583 134.453 43.5147C134.349 43.5492 134.245 43.5665 134.124 43.5665C134.003 43.5665 133.882 43.5492 133.761 43.5147L133.484 45.0885C130.924 44.6043 131.201 42.0619 132.931 41.1971C133.917 40.6955 134.228 40.3323 133.934 39.9519C133.847 39.8481 133.744 39.7962 133.623 39.7962C133.259 39.7962 132.723 40.194 132.204 40.5745C131.979 40.7474 131.685 40.8339 131.374 40.8339C130.7 40.8339 129.973 40.4015 129.662 39.3811L128.763 39.8827C128.607 37.9629 129.8 37.0117 131.011 37.0117C131.582 37.0117 132.17 37.2192 132.619 37.6343C132.792 37.79 132.965 37.8591 133.138 37.8591C133.692 37.8591 134.072 37.1673 133.329 36.7695C132.619 36.389 131.945 35.213 132.602 34.4693L131.53 33.4662C132.014 33.1721 132.533 33.0338 133.017 33.0338C133.536 33.0338 134.038 33.2067 134.453 33.5526V19.9932C134.124 19.924 133.744 19.5954 133.744 19.1285C133.744 18.6096 134.055 18.2983 134.453 18.1426V17.0184C133.64 17.1914 133.034 17.693 132.792 18.3848L131.651 18.4021C131.599 17.5373 132.014 16.759 132.896 16.465V15.3408C132.152 15.4965 131.668 15.8597 131.374 16.1883C131.288 16.2748 131.219 16.3785 131.132 16.4823L130.267 16.4996C130.233 15.6694 130.648 14.9257 131.426 14.6663V14.1474H128.261H92.2871H89.122V14.6663C89.9176 14.9257 90.3327 15.6694 90.2808 16.4996L89.4161 16.4823C89.3469 16.3785 89.2604 16.292 89.1739 16.1883C88.8799 15.877 88.3783 15.5138 87.652 15.3408V16.465C88.5167 16.759 88.9318 17.5373 88.8972 18.4021L87.7557 18.3848C87.5136 17.693 86.9083 17.2087 86.0954 17.0184V18.1426C86.4932 18.2983 86.7872 18.6096 86.7872 19.1285C86.7872 19.5781 86.424 19.924 86.0954 19.9932V33.5353C86.5105 33.1894 86.9947 33.0338 87.5136 33.0338C88.0151 33.0338 88.534 33.1894 89.001 33.4662L87.9287 34.4693C88.5686 35.2303 87.8941 36.389 87.2023 36.7695C86.4586 37.1673 86.8564 37.8591 87.3925 37.8591C87.5655 37.8591 87.7384 37.79 87.9114 37.6343C88.3611 37.2192 88.9491 37.0117 89.5198 37.0117C90.7305 37.0117 91.9239 37.9456 91.7682 39.8827L90.8343 39.3638C90.523 40.3842 89.7966 40.8166 89.122 40.8166C88.8107 40.8166 88.5167 40.7301 88.2919 40.5572C87.773 40.1767 87.2369 39.7789 86.8737 39.7789C86.7526 39.7789 86.6315 39.8308 86.5624 39.9346C86.2856 40.315 86.5797 40.6955 87.5655 41.1798C89.3123 42.0446 89.589 44.587 87.012 45.0712L86.7353 43.4974C86.6142 43.532 86.4932 43.5492 86.3721 43.5492C86.2683 43.5492 86.1646 43.532 86.0608 43.5147V47.2331C86.0608 51.4186 87.6865 54.8257 90.2808 57.4546C90.6094 57.6448 90.9207 57.9388 91.1975 58.3193C92.5292 59.4954 94.0858 60.4812 95.7634 61.3114C95.7634 61.3114 124.75 61.3114 124.75 61.3114Z",
          fill: "white"
        }), jsxRuntimeExports.jsx("path", {
          d: "M135.162 2.40404C135.162 2.21379 135.145 2.04084 135.127 1.85059H132.516C132.498 3.33798 132.118 4.77348 131.461 5.89766C131.011 6.65865 130.475 7.22939 129.87 7.5753H130.06C132.879 7.59259 135.162 5.27504 135.162 2.40404ZM132.516 12.3142C132.308 12.2796 132.118 12.2623 131.91 12.2623C131.755 12.2623 131.599 12.2796 131.443 12.2969C130.959 12.3488 130.475 12.5044 130.094 12.7811C129.662 13.0925 129.351 13.6113 129.333 14.1648H130.146C130.509 13.8707 130.942 13.6632 131.409 13.5594V14.6836C130.613 14.943 130.198 15.6867 130.25 16.5169L131.115 16.4996C131.184 16.3958 131.27 16.3094 131.357 16.2056C131.651 15.8943 132.152 15.5311 132.879 15.3581V16.4823C132.014 16.7763 131.599 17.5546 131.634 18.4194L132.775 18.4021C133.035 17.6757 133.674 17.1741 134.539 17.0185V18.1254C134.09 18.2637 133.726 18.575 133.726 19.1458C133.726 19.6473 134.176 20.0105 134.539 20.0105L134.505 20.9618C134.505 20.9618 134.505 20.9618 134.522 20.9618C134.764 20.9618 134.972 20.8926 135.196 20.7888C135.906 20.4083 136.182 19.5781 136.165 18.8172L137.203 18.3156C137.203 18.3502 137.22 18.3848 137.22 18.4367C137.306 19.0766 137.22 19.6992 137.012 20.2354L138.967 22.0859C139.347 21.152 139.849 20.27 140.454 19.4571C140.679 19.1804 140.904 18.9036 141.146 18.6615C140.299 18.0216 139.261 17.226 138.915 16.9666C137.825 16.1537 136.822 15.2544 135.784 14.3723C135.145 13.8361 134.487 13.3 133.796 12.833C133.398 12.5736 132.965 12.4007 132.516 12.3142ZM150.658 46.6451C150.814 46.7316 150.97 46.7662 151.125 46.7662C151.506 46.7662 151.869 46.5586 152.077 46.23C152.042 46.0398 151.973 45.8322 151.921 45.642C151.748 45.1231 151.488 44.6216 151.125 44.1373C150.658 43.5147 150.036 42.9439 149.206 42.477C149.084 42.4078 148.946 42.3213 148.79 42.2348C149.344 42.9093 149.673 43.3936 149.88 43.8087C150.105 44.2238 150.209 44.5524 150.364 44.8637C150.312 44.9156 150.278 44.9675 150.243 45.0194C149.863 45.5901 150.088 46.3511 150.658 46.6451ZM70.6335 43.7914C70.8411 43.3936 71.1697 42.892 71.7231 42.2175C71.5848 42.304 71.4291 42.3905 71.308 42.4597C70.4779 42.9266 69.8552 43.4974 69.3883 44.12C69.0251 44.6043 68.7829 45.1231 68.5927 45.6247C68.5235 45.8149 68.4716 46.0225 68.437 46.2127C68.6446 46.5413 69.0078 46.7489 69.3883 46.7489C69.5439 46.7489 69.6996 46.7143 69.8552 46.6278C70.426 46.3338 70.6508 45.5728 70.253 44.9848C70.2184 44.9329 70.1839 44.881 70.132 44.8291C70.3049 44.5351 70.4087 44.2065 70.6335 43.7914ZM142.287 13.1098C142.495 13.1098 142.72 13.0925 142.945 13.0752C142.27 12.833 141.734 12.4352 141.388 11.8818C140.904 11.1381 140.835 10.3425 141.025 9.63342C140.99 9.63342 140.956 9.65072 140.921 9.65072C140.108 9.82367 139.693 10.4463 139.849 11.2765C140.074 12.5217 140.852 13.1098 142.287 13.1098ZM152.163 48.0633C152.18 47.8904 152.198 47.7174 152.198 47.5272C151.869 47.7174 151.488 47.8212 151.108 47.8212C150.762 47.8212 150.451 47.7347 150.139 47.579C149.534 47.2677 149.119 46.697 148.998 46.0225C148.912 45.5901 148.963 45.1404 149.136 44.7426C149.136 44.7426 149.136 44.7253 149.119 44.7253C148.652 44.6389 148.133 44.5697 147.562 44.5005C146.611 44.3967 145.746 44.3448 144.951 44.3448C137.514 44.3448 136.909 48.4265 136.909 48.4265C135.75 52.7676 139.226 54.7219 139.226 54.7219C139.226 54.7219 140.022 58.6825 138.258 60.1872L136.424 59.5646L135.508 59.2533L134.989 59.0803C134.159 57.9043 132.81 57.0741 131.53 57.0741C130.285 57.0741 129.091 57.8697 128.503 59.9278L129.8 59.6511C129.8 60.9828 130.233 61.3287 130.907 61.3287C131.046 61.3287 131.201 61.3114 131.357 61.2941C131.547 61.2595 131.737 61.2249 131.945 61.1903C132.585 61.0693 133.052 60.9309 133.38 60.9309C133.692 60.9309 133.899 61.052 134.02 61.3806C134.193 61.8822 133.709 62.1935 133.086 62.3491C131.564 62.695 130.7 63.7673 130.976 65.2028C131.046 65.5314 131.149 65.86 131.34 66.2232C131.409 66.3789 131.495 66.5173 131.599 66.6729C131.599 66.6729 131.616 66.6729 131.616 66.6902L133.121 65.7736C133.346 65.9984 133.605 66.0849 133.865 66.0849C134.435 66.0849 134.989 65.6698 135.196 65.3066C135.214 65.272 135.231 65.2374 135.248 65.2028C135.421 64.8569 135.439 64.4591 135.439 64.0959C135.439 63.8884 135.421 63.6809 135.421 63.4906C135.421 63.2658 135.421 63.0755 135.473 62.9372C135.56 62.6604 135.784 62.4702 136.027 62.3664C136.113 62.3318 136.217 62.3145 136.303 62.3145C136.459 62.3145 136.615 62.3664 136.753 62.4702C137.116 62.7296 137.116 63.1274 137.064 63.5252C137.012 63.9403 136.943 64.3208 137.168 64.6667C137.185 64.7013 137.203 64.7186 137.22 64.7532C137.306 64.8569 137.41 64.9607 137.514 65.0472C137.583 65.0991 137.894 65.3239 137.894 65.4104L137.739 67.2437C138.707 67.1745 139.78 66.9669 140.299 66.0849C140.402 65.9119 140.489 65.6871 140.541 65.4623C140.731 64.7877 140.817 63.9576 140.921 62.7988C141.354 62.6258 141.734 62.401 142.063 62.107C142.478 61.7438 142.806 61.2941 142.997 60.7234C143.515 59.1668 143.965 56.0537 143.273 52.7676C143.273 52.7676 150.243 51.9028 151.748 51.1418C151.886 50.0868 152.025 49.0318 152.163 48.0633ZM146.023 7.93849C146.023 7.93849 145.072 8.50924 145.262 9.40858C145.574 10.0658 145.971 10.7403 146.473 11.3283L147.441 10.3598C148.583 9.30481 149.586 8.92432 150.416 8.92432C151.506 8.92432 152.267 9.61613 152.578 10.4117C153.062 11.6224 153.01 12.5909 152.838 13.2135C152.699 13.6805 152.319 14.061 151.454 14.1302C151.298 14.1475 151.125 14.1475 150.952 14.1475C149.171 14.1475 146.836 13.5075 146.836 13.5075C146.473 15.4446 146.248 15.8251 149.015 15.8251C149.655 15.8251 150.451 15.8078 151.437 15.7732L148.669 17.0358C148.358 17.0185 148.064 17.0012 147.77 17.0012C145.729 17.0012 144.103 17.6065 142.824 18.5923C142.53 18.8172 142.253 19.0593 141.993 19.3187C141.008 20.3218 140.299 21.5671 139.797 22.8815C139.659 23.262 139.538 23.6425 139.434 24.023C138.898 26.0293 138.828 28.122 139.105 29.7996C139.313 29.5402 139.52 29.298 139.762 29.0559L139.883 28.9348C140.714 28.122 142.115 26.7211 143.792 25.8563C144.415 25.3029 145.003 24.7494 145.574 24.1441C146.801 22.8469 147.891 21.4114 148.704 19.7857C148.202 21.5325 147.355 23.2101 146.352 24.7494C145.954 25.3547 145.539 25.9428 145.107 26.5135C144.726 26.6692 144.38 26.8421 144.034 27.0497C142.564 27.8798 141.319 29.1597 140.593 29.8861C140.16 30.3012 139.814 30.7681 139.486 31.2524C139.226 31.6329 139.001 32.0134 138.759 32.4112C138.586 32.7052 138.396 33.0165 138.223 33.3105C137.445 34.5731 136.407 35.8183 135.819 35.8183C135.612 35.8183 135.456 35.6627 135.387 35.3168C135.075 33.7429 134.09 33.0511 133.017 33.0511C132.516 33.0511 131.997 33.2067 131.53 33.4835L132.602 34.4866C131.962 35.2476 132.637 36.4064 133.329 36.7869C134.072 37.1846 133.674 37.8764 133.138 37.8764C132.965 37.8764 132.792 37.8073 132.619 37.6516C132.17 37.2365 131.582 37.029 131.011 37.029C129.8 37.029 128.607 37.9629 128.763 39.9L129.697 39.3811C130.008 40.4015 130.734 40.8339 131.409 40.8339C131.72 40.8339 132.014 40.7474 132.239 40.5745C132.758 40.194 133.294 39.7962 133.657 39.7962C133.778 39.7962 133.899 39.8481 133.968 39.9519C134.245 40.3324 133.951 40.7129 132.965 41.1971C131.219 42.0619 130.942 44.6043 133.519 45.0885L133.796 43.5147C133.917 43.5493 134.038 43.5666 134.159 43.5666C134.902 43.5666 135.421 42.9093 135.508 42.4251C135.629 41.716 135.594 41.2836 135.629 40.8339C135.646 40.4361 135.906 40.2632 136.165 40.2632C136.476 40.2632 136.788 40.488 136.822 40.8858C136.874 41.6295 136.857 42.598 138.171 42.8229L138.586 44.1546C139.832 43.7222 141.077 42.2867 138.811 39.8654C138.777 38.6374 140.074 37.9283 141.89 36.9079C142.201 36.735 142.53 36.5447 142.858 36.3545C143.031 36.2507 143.204 36.1469 143.377 36.0432C143.74 35.8183 145.141 34.7979 146.369 33.7429L147.441 34.3136C147.217 34.5039 146.974 34.7114 146.698 34.9536C145.591 35.8702 144.397 36.7696 143.948 37.029C143.861 37.0809 143.775 37.1328 143.688 37.1846C144.864 38.2742 146.127 39.2255 147.268 39.9865C147.735 40.2978 148.185 40.5918 148.6 40.8512C149.015 41.1106 149.413 41.3355 149.742 41.5257C150.658 42.0446 151.385 42.6845 151.938 43.4109C152.301 43.8779 152.578 44.3794 152.786 44.881C152.993 45.3653 153.132 45.8668 153.201 46.3684C153.235 46.5413 153.253 46.697 153.27 46.8699C153.304 47.3369 153.287 47.7866 153.235 48.219C153.166 48.6859 153.114 49.1529 153.045 49.6199C152.959 50.329 152.889 51.0208 152.838 51.7299C152.768 52.5601 152.734 53.3729 152.734 54.1858C152.734 56.6763 153.114 58.4577 154.844 60.1526C156.089 61.3806 157.836 61.6746 159.531 61.7957C160.413 61.8476 162.886 62.2108 164.564 62.4702C165.532 62.6086 166.259 63.4214 166.31 64.4072C166.38 65.739 166.362 67.4858 165.895 68.0738L163.612 67.7625C163.076 66.9669 161.796 66.3443 160.551 66.3443C159.583 66.3443 158.631 66.7248 158.095 67.7279C157.94 68.0219 157.801 68.3678 157.732 68.7829C157.715 68.904 157.697 69.0251 157.68 69.1634L158.407 68.8694L158.822 68.6965C158.839 68.8002 158.856 68.8867 158.874 68.9732C159.116 69.9763 159.635 70.3395 160.257 70.3395C160.551 70.3395 160.862 70.253 161.191 70.132C161.226 70.1147 161.26 70.0974 161.312 70.0801C161.9 69.8379 162.315 69.6477 162.627 69.6477C162.834 69.6477 162.99 69.7342 163.128 69.9763C163.318 70.3049 163.128 70.5816 162.8 70.8065C162.696 70.8756 162.557 70.9448 162.436 70.9967C160.69 71.7231 160.188 73.418 161.796 75.1821L163.007 74.1098C163.197 74.2309 163.388 74.2828 163.561 74.2828C164.149 74.2828 164.685 73.7466 164.823 73.3489C165.048 72.7435 164.806 72.0517 164.719 71.5502C164.702 71.4118 164.685 71.2734 164.702 71.1697C164.737 70.8929 164.927 70.6681 165.152 70.547C165.255 70.4952 165.359 70.4606 165.48 70.4606C165.584 70.4606 165.688 70.4779 165.792 70.5297C165.895 70.5816 165.982 70.6508 166.051 70.7373C166.207 70.9275 166.241 71.187 166.241 71.4464C166.241 71.5847 166.241 71.7404 166.259 71.8788C166.293 72.1209 166.362 72.3457 166.57 72.536C166.674 72.6225 166.777 72.6916 166.881 72.7608C166.95 72.7954 167.279 72.9511 167.296 73.0202L167.452 74.7152C168.663 74.4212 169.994 73.8331 169.666 71.9479C169.614 71.6366 169.51 71.2734 169.337 70.8756C169.285 70.7373 169.216 70.5816 169.13 70.426C170.185 69.9071 170.876 68.9213 171.049 67.7625C171.205 66.7075 171.032 62.9545 170.911 60.8098C170.859 59.9451 170.202 59.236 169.354 59.1149C168.386 58.9766 167.141 58.7863 166.224 58.5961C164.771 58.2848 163.37 57.6448 163.042 56.6071C162.765 55.7078 162.921 55.604 163.007 54.6874C163.076 53.9783 163.163 53.2519 163.215 52.5428C163.215 52.439 163.232 52.3179 163.232 52.2142C163.249 51.7991 163.232 51.3667 163.18 50.9516C163.267 51.0035 163.353 51.0554 163.439 51.1073C163.716 51.2629 164.01 51.3667 164.304 51.4532C164.633 51.5396 164.961 51.5742 165.307 51.5742C166.034 51.5742 166.743 51.384 167.383 50.9862C168.542 50.2771 169.216 49.0491 169.181 47.7001C169.13 45.2961 167.763 43.6012 166.449 41.9581C165.826 41.1798 165.169 40.367 164.685 39.5022C163.145 36.735 162.782 33.7256 163.612 30.5606C163.976 29.177 164.806 27.9317 165.688 26.6C166.016 26.0984 166.328 25.6315 166.639 25.1126C166.639 25.1126 167.331 25.4239 167.781 25.3201C167.902 25.2856 168.023 25.2337 168.161 25.1472C169.216 24.49 170.34 21.8092 170.288 18.5923C170.254 16.0326 169.648 13.9053 168.455 12.1585C168.715 12.8849 168.939 13.6459 169.078 14.4069C169.233 15.2371 169.285 16.1018 169.233 16.932C169.181 17.7795 169.008 18.5923 168.732 19.3533C168.853 18.5404 168.853 17.7276 168.749 16.932C168.645 16.1364 168.438 15.3754 168.144 14.649C167.884 14.0091 167.573 13.3865 167.21 12.7984C167.452 14.2858 167.452 15.7905 167.054 17.6584C166.812 18.8172 166.31 19.9241 165.878 20.8926C165.48 21.7746 165.186 22.4837 165.065 23.0718C164.927 23.7117 165.013 24.196 165.446 24.5938C165.377 24.7148 165.29 24.8359 165.221 24.9569C165.031 25.251 164.823 25.5623 164.616 25.8736C163.716 27.2399 162.782 28.6408 162.367 30.232C161.468 33.691 161.883 37.1155 163.561 40.1421C164.097 41.1106 164.788 41.9581 165.446 42.7883C166.674 44.3275 167.85 45.7803 167.902 47.752C167.919 48.6513 167.487 49.4296 166.726 49.8966C165.93 50.3809 164.979 50.4155 164.166 50.0177C164.149 50.0004 164.114 50.0004 164.097 49.9831C163.474 49.6545 162.921 49.0318 162.592 48.3054C162.575 48.2708 162.575 48.2363 162.557 48.2017C162.16 47.0429 161.675 45.9014 161.122 44.8118C159.496 41.5603 157.473 38.5164 156.193 35.0919C155.086 32.1517 155.587 28.5716 155.587 28.5716C156.712 29.0213 158.355 29.0732 158.355 29.0732C158.303 25.4066 166.172 16.8974 161.381 6.52029C161.053 7.05644 160.62 7.60989 160.015 8.18063L159.583 8.59571V7.09103C162.09 4.49675 160.932 2.02354 159.998 1.19337C159.289 1.4528 158.476 2.23109 157.87 3.18232L156.815 2.83642C157.075 2.40404 157.369 1.98895 157.697 1.60846C157.594 1.53928 157.49 1.48739 157.369 1.4701C157.317 1.4701 157.248 1.4528 157.161 1.4528C155.587 1.4528 149.672 2.81912 149.084 3.13043L148.617 4.72159C147.009 5.15397 145.522 6.01873 144.467 6.58947C144.553 7.03914 145.037 8.05956 146.023 7.93849ZM157.767 18.0908C158.199 16.8974 158.545 15.6694 158.822 14.4242C158.683 15.704 158.493 16.9666 158.199 18.2291C157.905 19.4917 157.507 20.7196 157.04 21.9303C156.573 23.141 156.037 24.317 155.484 25.4758C155.034 26.3924 154.567 27.2918 154.1 28.1911C153.668 28.0528 153.149 27.8279 152.578 27.4993C153.91 25.5796 155.19 23.6252 156.262 21.5671C156.833 20.4429 157.352 19.2841 157.767 18.0908ZM153.218 19.9759C152.941 20.8061 152.665 21.6536 152.319 22.4837C151.973 23.3139 151.54 24.1268 151.091 24.8878C150.814 25.3547 150.537 25.8217 150.261 26.2887C149.672 26.0811 149.084 25.9601 148.514 25.9255C149.015 25.3374 149.534 24.7321 150.018 24.1441C150.572 23.4696 151.073 22.7951 151.54 22.0859C151.99 21.3596 152.405 20.5986 152.803 19.8203C153.201 19.042 153.581 18.2464 153.979 17.4681C153.737 18.2983 153.477 19.1458 153.218 19.9759ZM152.872 5.01561C151.661 6.20898 151.264 6.93537 151.264 6.93537C149.655 7.00455 149.309 5.98414 149.309 4.98102C150.883 5.4134 152.872 5.01561 152.872 5.01561ZM131.426 8.68219H89.1567V11.2073C89.7274 11.2592 90.4538 11.4494 91.0937 11.8991C91.8201 12.4352 92.2698 13.2654 92.2871 14.1129V14.1475H128.244V14.1129C128.261 13.2654 128.711 12.4352 129.437 11.8991C130.094 11.4148 130.855 11.2419 131.426 11.19V8.68219ZM98.0118 13.2308L94.5355 11.5013L98.0118 9.77178L101.488 11.5013L98.0118 13.2308ZM110.274 13.0406C108.579 13.0406 107.196 12.3488 107.196 11.5013C107.196 10.6538 108.579 9.96203 110.274 9.96203C111.969 9.96203 113.353 10.6538 113.353 11.5013C113.353 12.3488 111.969 13.0406 110.274 13.0406ZM122.536 13.2308L119.06 11.5013L122.536 9.77178L126.013 11.5013L122.536 13.2308ZM86.4413 61.3806C86.5624 61.052 86.7699 60.9309 87.0812 60.9309C87.4099 60.9309 87.8768 61.052 88.5167 61.1903C88.7243 61.2249 88.9145 61.2595 89.1048 61.2941C89.2604 61.3114 89.4161 61.3287 89.5545 61.3287C90.229 61.3287 90.6613 61.0001 90.6613 59.6511L91.9585 59.9278C91.3704 57.8697 90.1771 57.0741 88.9318 57.0741C87.652 57.0741 86.303 57.9216 85.4728 59.0803L84.9539 59.2533L84.0719 59.5992L82.2386 60.2218C80.4572 58.7171 81.2701 54.7565 81.2701 54.7565C81.2701 54.7565 84.7464 52.8022 83.5876 48.4611C83.5876 48.4611 82.9823 44.3794 75.5454 44.3794C74.7498 44.3794 73.885 44.4313 72.9338 44.5351C72.363 44.6043 71.8442 44.6735 71.3772 44.7599C71.3772 44.7599 71.3772 44.7772 71.3599 44.7772C71.5329 45.175 71.5848 45.6247 71.4983 46.0571C71.3772 46.7316 70.9621 47.3023 70.3568 47.6136C70.0628 47.7693 69.7342 47.8558 69.3883 47.8558C69.0078 47.8558 68.6446 47.752 68.2987 47.5617C68.2987 47.752 68.316 47.9249 68.3333 48.0979C68.4716 49.0664 68.61 50.1041 68.6965 51.1937C70.2012 51.9547 77.1711 52.8195 77.1711 52.8195C76.4966 56.1056 76.929 59.2187 77.4478 60.7753C77.6381 61.346 77.9667 61.7957 78.3818 62.1589C78.7104 62.4529 79.0909 62.6777 79.5233 62.8507C79.6097 63.9922 79.6962 64.8396 79.9037 65.5141C79.9556 65.7563 80.0421 65.9638 80.1459 66.1368C80.6647 67.0188 81.737 67.2264 82.7056 67.2955L82.5499 65.4623C82.5499 65.3758 82.8785 65.1509 82.9304 65.0991C83.0342 65.0126 83.1379 64.9088 83.2244 64.805C83.2417 64.7704 83.259 64.7532 83.2763 64.7186C83.5011 64.3554 83.432 63.9749 83.3801 63.5771C83.3282 63.1793 83.3282 62.7815 83.6914 62.5221C83.8298 62.4183 83.9854 62.3664 84.1411 62.3664C84.2448 62.3664 84.3313 62.3837 84.4178 62.4183C84.6599 62.5048 84.8848 62.7123 84.9712 62.989C85.0231 63.1274 85.0231 63.3177 85.0231 63.5425C85.0231 63.7327 85.0058 63.9403 85.0058 64.1478C85.0058 64.511 85.0404 64.9088 85.1961 65.2547C85.2134 65.2893 85.2307 65.3239 85.248 65.3585C85.4555 65.7044 86.0089 66.1368 86.5797 66.1368C86.8391 66.1368 87.0985 66.0503 87.3234 65.8255L88.8281 66.7421C88.8281 66.7421 88.8454 66.7421 88.8454 66.7248C88.9491 66.5691 89.0183 66.4135 89.1048 66.2751C89.2777 65.9119 89.3988 65.5833 89.468 65.2547C89.7447 63.8019 88.8799 62.7469 87.358 62.401C86.7699 62.2108 86.2684 61.8994 86.4413 61.3806ZM143.066 69.3883C142.651 68.7483 142.149 68.2987 141.682 67.9528C141.509 67.849 141.336 67.7625 141.146 67.6587L140.662 67.4166C139.832 68.1257 138.707 68.2987 137.877 68.3505L136.615 68.437L136.718 67.1745L136.822 65.86C136.684 65.739 136.545 65.6006 136.407 65.4277C136.407 65.4104 136.39 65.4104 136.39 65.3931C136.338 65.5487 136.269 65.7044 136.182 65.8428C135.802 66.5 134.902 67.1572 133.917 67.1572C133.657 67.1572 133.415 67.1053 133.173 67.0188L132.602 67.3647C132.637 67.3993 132.689 67.4339 132.723 67.4685C134.574 69.1807 135.957 69.371 138.31 69.9071C139.901 70.2703 141.388 71.187 141.89 72.83C142.184 73.7812 142.132 74.8189 142.08 75.8048C142.08 75.8048 145.331 73.9542 143.602 70.3049C143.464 70.0455 143.273 69.7169 143.066 69.3883ZM120.876 68.1257C119.856 67.088 118.766 66.206 117.676 65.6871C116.777 65.2547 115.878 64.9607 115.03 64.7704C114.477 64.6494 113.941 64.5629 113.439 64.511C113.145 64.4764 112.868 64.4591 112.592 64.4418C111.865 64.4764 111.087 64.4937 110.274 64.4937C109.461 64.4937 108.683 64.4764 107.957 64.4418C107.68 64.4591 107.403 64.4764 107.092 64.511C106.59 64.5629 106.054 64.6494 105.501 64.7704C104.653 64.9607 103.754 65.2547 102.854 65.6871C101.765 66.2232 100.675 67.088 99.6548 68.1257C99.5857 68.1949 99.5338 68.2468 99.4819 68.316C97.2681 70.72 97.8561 73.0721 97.8561 73.0721C97.8561 73.0721 100.693 69.3018 104.93 69.3018C106.953 69.3018 108.7 69.9763 109.6 70.426L110.257 70.7719L110.914 70.426C111.813 69.9936 113.56 69.3018 115.584 69.3018C119.821 69.3018 122.657 73.0721 122.657 73.0721C122.657 73.0721 123.263 70.72 121.032 68.316C120.997 68.2641 120.945 68.1949 120.876 68.1257ZM98.8766 67.3647C100.554 65.6698 102.405 64.5975 104.082 64.0268C102.56 63.7846 101.263 63.4733 100.105 63.1101C99.9835 63.1101 99.8624 63.0928 99.7413 63.0928C99.3781 63.0928 99.0149 63.1101 98.6863 63.1447C97.7178 63.2658 96.8011 63.4387 95.9191 63.4387C93.6188 63.4387 91.5953 63.0928 89.9522 62.6431C90.1252 62.868 90.2809 63.1101 90.3846 63.3868C90.644 64.0268 90.6959 64.7532 90.5403 65.4968C90.6095 65.5141 90.6613 65.5314 90.7305 65.5487C91.0418 65.6179 91.3359 65.6871 91.578 65.7217C92.045 65.8082 92.3217 65.8255 92.3217 65.8255C92.3217 65.8255 91.9066 66.0503 91.3186 66.4481C90.6095 66.9323 89.6582 67.6587 88.8454 68.5408C85.0231 72.7435 89.2431 75.9258 89.2431 75.9258C89.2431 75.9258 88.3092 71.7923 90.2981 70.4779C93.4805 68.4024 95.1754 70.1838 98.7382 67.4685C98.7901 67.4685 98.8247 67.4166 98.8766 67.3647ZM87.9287 67.3993L87.358 67.0534C87.1331 67.1399 86.8737 67.1918 86.6143 67.1918C85.6112 67.1918 84.7118 66.5346 84.3486 65.8773C84.2621 65.7217 84.193 65.5833 84.1411 65.4277C84.1411 65.445 84.1238 65.445 84.1238 65.4623C83.9854 65.6352 83.847 65.7736 83.7087 65.8946L83.8125 67.2091L83.9162 68.4716L82.6537 68.3851C81.8235 68.3333 80.7166 68.1603 79.8692 67.4512L79.3849 67.6933C79.1946 67.7971 79.0217 67.8836 78.8487 67.9874C78.3645 68.3333 77.8802 68.7829 77.4651 69.4229C77.2403 69.7515 77.0673 70.0628 76.929 70.3741C75.1995 74.0234 78.451 75.874 78.451 75.874C78.3991 74.8881 78.3645 73.8504 78.6412 72.8992C79.1428 71.2561 80.6301 70.3568 82.2213 69.9763C84.5907 69.4229 85.9571 69.2499 87.8076 67.5377C87.8595 67.4685 87.8941 67.4339 87.9287 67.3993ZM129.212 66.4827C128.624 66.0849 128.209 65.86 128.209 65.86C128.209 65.86 128.503 65.8255 128.953 65.7563C129.195 65.7217 129.489 65.6525 129.8 65.5833C129.852 65.566 129.921 65.5487 129.991 65.5314C129.835 64.7877 129.887 64.0613 130.146 63.4214C130.25 63.162 130.406 62.9026 130.579 62.6777C128.936 63.1274 126.912 63.4733 124.612 63.4733C123.73 63.4733 122.813 63.2831 121.845 63.1793C121.516 63.1447 121.153 63.1274 120.79 63.1274C120.668 63.1274 120.565 63.1274 120.444 63.1274C119.285 63.4906 117.97 63.8019 116.466 64.0441C118.143 64.6148 119.994 65.6698 121.672 67.382C121.723 67.4339 121.758 67.4685 121.793 67.5204C125.355 70.2357 127.05 68.4543 130.233 70.5297C132.222 71.8269 131.288 75.9777 131.288 75.9777C131.288 75.9777 135.49 72.7954 131.686 68.5927C130.873 67.6933 129.904 66.9496 129.212 66.4827ZM170.738 71.8615C170.859 72.6052 170.79 73.2624 170.513 73.8504C169.925 75.0957 168.628 75.5453 167.711 75.7875L166.483 76.0988L166.362 74.8362L166.241 73.6602C166.138 73.591 166.016 73.5045 165.913 73.418C165.895 73.5218 165.861 73.6256 165.826 73.7293C165.532 74.5422 164.598 75.3724 163.543 75.3724C163.439 75.3724 163.336 75.3724 163.232 75.3551L162.488 76.0123L161.693 76.7214L160.966 75.9258C159.946 74.8189 159.531 73.5737 159.79 72.4322C159.877 72.069 160.015 71.7231 160.223 71.4118C159.583 71.4118 159.012 71.1697 158.58 70.72C158.424 70.547 158.268 70.3568 158.164 70.132L158.095 70.1492L156.418 70.8411L156.608 69.0424C156.608 68.9732 156.625 68.9213 156.625 68.8521C155.881 68.9732 154.982 69.2499 153.841 69.6823C153.685 69.7688 153.512 69.8379 153.356 69.8898C153.27 69.9244 153.201 69.959 153.114 69.9763C153.477 70.1838 153.841 70.3914 154.169 70.5989C155.812 71.6539 156.936 72.7954 157.525 73.9888C157.888 74.3693 158.286 74.7844 158.718 75.2513C160.499 77.1538 162.903 78.0359 165.377 78.0359C169.614 78.0359 173.99 75.4243 175.529 70.8238C175.512 70.8411 173.419 71.5502 170.738 71.8615ZM153.495 71.481C151.298 70.0974 148.877 69.3191 148.877 69.3191C149.309 69.3537 149.707 69.371 150.088 69.371C151.039 69.371 151.817 69.2499 152.457 69.0597C152.82 68.9559 153.149 68.8175 153.426 68.6792C155.449 67.6414 155.518 65.7909 155.518 65.7909C153.91 66.8805 152.492 67.261 151.177 67.261C149.482 67.261 147.943 66.6556 146.369 66.2059C145.902 66.0676 145.435 66.0157 144.986 66.0157C143.688 66.0157 142.564 66.5 141.924 66.8459C142.737 67.3474 143.429 67.9874 143.965 68.8002C144.173 69.1288 144.363 69.4574 144.519 69.7688C145.037 70.4779 145.366 71.1005 145.885 71.5156C147.078 72.5187 148.739 72.7262 150.243 72.83C154.809 73.1759 156.677 77.2922 156.677 77.2922C157.058 76.3409 156.988 75.4416 156.625 74.6287C156.054 73.3834 154.826 72.3284 153.495 71.481ZM78.5893 66.8459C77.9494 66.5 76.8425 66.0157 75.5281 66.0157C75.0784 66.0157 74.6287 66.0676 74.1444 66.2059C72.5533 66.6556 71.0313 67.261 69.3364 67.261C68.022 67.261 66.6038 66.8978 64.9953 65.7909C64.9953 65.7909 65.0818 67.6414 67.088 68.6792C67.3647 68.8175 67.6933 68.9559 68.0565 69.0597C68.6965 69.2499 69.4921 69.371 70.426 69.371C70.8065 69.371 71.2043 69.3537 71.6366 69.3191C71.6366 69.3191 69.2153 70.0974 67.0188 71.481C65.6871 72.3284 64.4592 73.3834 63.9057 74.6287C63.5425 75.4416 63.4733 76.3236 63.8538 77.2922C63.8538 77.2922 65.7044 73.1759 70.2876 72.83C71.7923 72.7089 73.4353 72.5014 74.646 71.5156C75.1649 71.0832 75.4935 70.4606 76.0123 69.7688C76.168 69.4401 76.3582 69.1288 76.5658 68.8002C77.0846 67.9874 77.7764 67.3301 78.5893 66.8459ZM51.4013 70.4433C51.3321 70.5989 51.2629 70.7546 51.1937 70.8929C51.0381 71.2907 50.917 71.6366 50.8651 71.9652C50.5192 73.8504 51.8683 74.4385 53.0789 74.7325L53.2346 73.0375C53.2519 72.9684 53.5805 72.8127 53.6497 72.7781C53.7534 72.7089 53.8745 72.6398 53.961 72.5533C54.1685 72.363 54.2377 72.1382 54.2723 71.8961C54.2896 71.7577 54.2896 71.6193 54.2896 71.4637C54.3069 71.2043 54.3415 70.9448 54.4798 70.7546C54.549 70.6681 54.6182 70.5989 54.7393 70.547C54.843 70.4952 54.9468 70.4779 55.0506 70.4779C55.1716 70.4779 55.2754 70.5124 55.3792 70.5643C55.604 70.6854 55.7943 70.9102 55.8289 71.187C55.8461 71.2907 55.8289 71.4291 55.8116 71.5675C55.7251 72.069 55.483 72.7608 55.7078 73.3662C55.8462 73.7639 56.3823 74.3001 56.9703 74.3001C57.1606 74.3001 57.3335 74.2482 57.5238 74.1271L58.7344 75.1994C60.3429 73.4353 59.8413 71.7404 58.0945 71.014C57.9562 70.9621 57.8351 70.8929 57.7313 70.8238C57.4027 70.5989 57.2125 70.3049 57.4027 69.9936C57.5411 69.7515 57.6967 69.665 57.9043 69.665C58.2156 69.665 58.6134 69.8552 59.2187 70.0974C59.2533 70.1147 59.2879 70.132 59.3398 70.1492C59.6684 70.2703 59.9797 70.3568 60.2737 70.3568C60.8963 70.3568 61.3979 69.9936 61.6573 68.9905C61.6746 68.904 61.6919 68.8002 61.7092 68.7138L62.1243 68.8867L62.8507 69.1807C62.8334 69.0596 62.8161 68.9213 62.7988 68.8002C62.7296 68.3851 62.5913 68.0392 62.4356 67.7452C61.8995 66.7594 60.9482 66.3616 59.9797 66.3616C58.7344 66.3616 57.4546 66.9842 56.9185 67.7798L54.6355 68.0911C54.1685 67.5031 54.1512 65.7736 54.2204 64.4245C54.2723 63.4387 54.9987 62.6431 55.9672 62.4875C57.6276 62.2454 60.1181 61.8822 61.0001 61.813C62.6777 61.6919 64.4246 61.3979 65.6871 60.1699C67.4166 58.4577 67.7971 56.6763 67.7971 54.2031C67.7971 53.3902 67.7625 52.5773 67.6933 51.7472C67.6415 51.0381 67.555 50.329 67.4858 49.6372C67.4339 49.1702 67.3647 48.7032 67.2956 48.2363C67.2264 47.8039 67.2264 47.3369 67.261 46.8872C67.2783 46.7143 67.2956 46.5586 67.3302 46.3857C67.4166 45.8841 67.555 45.3998 67.7452 44.8983C67.9528 44.3794 68.2468 43.8952 68.5927 43.4282C69.1461 42.7018 69.8725 42.0619 70.7892 41.543C71.1178 41.3528 71.5156 41.1279 71.9307 40.8685C72.3458 40.6091 72.7954 40.3324 73.2624 40.0038C74.4039 39.2428 75.6664 38.2915 76.8425 37.2019C76.756 37.15 76.6695 37.0982 76.5831 37.0463C76.1507 36.7869 74.9573 35.9048 73.8331 34.9709C73.5564 34.746 73.3143 34.5385 73.0894 34.3309L74.1617 33.7602C75.407 34.8152 76.7906 35.8529 77.1538 36.0605C77.3268 36.1642 77.4997 36.268 77.6727 36.3718C78.0013 36.562 78.3299 36.7523 78.6412 36.9252C80.4572 37.9629 81.7543 38.672 81.7197 39.8827C79.4714 42.304 80.6993 43.7395 81.9446 44.1719L82.3597 42.8402C83.6741 42.6153 83.6568 41.6468 83.7087 40.9031C83.7433 40.5053 84.0546 40.2805 84.3659 40.2805C84.6253 40.2805 84.8848 40.4534 84.9021 40.8512C84.9366 41.2836 84.9021 41.7333 85.0231 42.4424C85.1096 42.9266 85.6284 43.5839 86.3721 43.5839C86.4932 43.5839 86.6143 43.5666 86.7353 43.532L87.0121 45.1058C89.5718 44.6216 89.295 42.0792 87.5655 41.2144C86.5797 40.7129 86.2684 40.3497 86.5624 39.9692C86.6489 39.8481 86.7526 39.8135 86.8737 39.8135C87.2369 39.8135 87.7731 40.2113 88.2919 40.5918C88.5167 40.7647 88.8108 40.8512 89.1221 40.8512C89.7966 40.8512 90.523 40.4188 90.8343 39.3984L91.7682 39.9173C91.9239 37.9975 90.7305 37.0463 89.5199 37.0463C88.9491 37.0463 88.3611 37.2538 87.9114 37.6689C87.7385 37.8246 87.5655 37.8937 87.3926 37.8937C86.8391 37.8937 86.4586 37.2019 87.2023 36.8041C87.9114 36.4237 88.5859 35.2476 87.9287 34.5039L89.001 33.5008C88.5167 33.2067 87.9979 33.0684 87.5136 33.0684C86.4413 33.0684 85.4555 33.7602 85.1442 35.3341C85.075 35.6973 84.9193 35.8356 84.7118 35.8356C84.1238 35.8356 83.0861 34.5731 82.3078 33.3278C82.1175 33.0338 81.9446 32.7225 81.7716 32.4285C81.5468 32.0307 81.3047 31.6502 81.0452 31.2697C80.7166 30.7854 80.3707 30.3185 79.9383 29.9034C79.2119 29.177 77.9494 27.9144 76.4966 27.067C76.1507 26.8767 75.7875 26.6865 75.4243 26.5308C74.9919 25.9601 74.5595 25.372 74.179 24.7667C73.1586 23.2101 72.3112 21.5498 71.8269 19.803C72.6225 21.446 73.7294 22.8815 74.9573 24.1614C75.5281 24.7667 76.1161 25.3201 76.7387 25.8736C78.4164 26.7384 79.8173 28.1393 80.6474 28.9521L80.7685 29.0732C81.0106 29.3153 81.2355 29.5575 81.4257 29.8169C81.7024 28.122 81.6333 26.0293 81.0971 24.0403C80.9933 23.6598 80.8723 23.262 80.7339 22.8988C80.2324 21.5671 79.5233 20.3218 78.5374 19.336C78.278 19.0766 78.0013 18.8345 77.7073 18.6096C76.4274 17.6238 74.8017 17.0185 72.7608 17.0185C72.4668 17.0185 72.1728 17.0358 71.8615 17.0531L69.0943 15.7905C70.0801 15.8078 70.8757 15.8424 71.5156 15.8424C74.2828 15.8424 74.058 15.4619 73.6948 13.5248C73.6948 13.5248 71.3599 14.1648 69.5785 14.1648C69.4056 14.1648 69.2326 14.1648 69.077 14.1475C68.2122 14.0783 67.8317 13.6978 67.6933 13.2308C67.5204 12.6082 67.4685 11.6397 67.9528 10.429C68.2641 9.63342 69.0251 8.94161 70.1147 8.94161C70.9448 8.94161 71.948 9.3394 73.0894 10.3771L74.058 11.3456C74.5595 10.7576 74.9573 10.0831 75.2686 9.42588C75.4762 8.52653 74.5077 7.95579 74.5077 7.95579C75.4935 8.07686 75.9777 7.05644 76.1334 6.58947C75.0784 6.01873 73.5737 5.15397 71.9826 4.72159L71.5156 3.13043C70.9103 2.81912 64.9953 1.4528 63.4387 1.4528C63.3523 1.4528 63.3004 1.4528 63.2312 1.4701C63.1101 1.48739 62.9891 1.53928 62.9026 1.60846C63.2312 1.97166 63.5252 2.38674 63.7846 2.83642L62.7296 3.18232C62.1416 2.23109 61.3287 1.43551 60.6023 1.19337C59.6511 2.02354 58.5096 4.49675 61.0174 7.09103V8.59571L60.585 8.18063C59.9797 7.60989 59.5473 7.05644 59.2187 6.52029C54.428 16.8974 62.2973 25.4066 62.2454 29.0732C62.2454 29.0732 63.8884 29.0213 65.0126 28.5716C65.0126 28.5716 65.5142 32.1517 64.4073 35.0919C63.1274 38.5164 61.1039 41.5603 59.4781 44.8118C58.9247 45.9187 58.4404 47.0429 58.0426 48.2017C58.0253 48.2363 58.0253 48.2708 58.0081 48.3054C57.6794 49.0145 57.126 49.6372 56.5034 49.9831C56.4861 50.0004 56.4515 50.0004 56.4342 50.0177C55.6213 50.4327 54.6701 50.3809 53.8745 49.8966C53.0962 49.4296 52.6811 48.634 52.6984 47.752C52.7503 45.7803 53.9091 44.3275 55.1543 42.7883C55.8116 41.9581 56.5034 41.1106 57.0395 40.1421C58.7172 37.1155 59.1322 33.691 58.2329 30.232C57.8178 28.6408 56.8839 27.2399 55.9845 25.8736C55.777 25.5623 55.5867 25.2683 55.3792 24.9569C55.2927 24.8359 55.2235 24.7148 55.1543 24.5938C55.5867 24.196 55.6732 23.7117 55.5348 23.0718C55.4138 22.4837 55.1025 21.7746 54.722 20.8926C54.2896 19.9241 53.788 18.8172 53.5459 17.6584C53.1481 15.7905 53.1481 14.2858 53.3902 12.7984C53.027 13.3865 52.7157 14.0091 52.4563 14.649C52.1623 15.3754 51.9547 16.1364 51.851 16.932C51.7472 17.7276 51.7472 18.5404 51.8683 19.3533C51.5915 18.5923 51.4186 17.7622 51.3667 16.932C51.3148 16.0845 51.3667 15.2371 51.5224 14.4069C51.6607 13.6459 51.8683 12.8849 52.145 12.1585C50.9516 13.9053 50.3463 16.0326 50.3117 18.5923C50.2771 21.8092 51.384 24.5073 52.439 25.1472C52.5774 25.2337 52.6984 25.2856 52.8195 25.3201C53.2692 25.4239 53.961 25.1126 53.961 25.1126C54.2723 25.6315 54.5836 26.0984 54.9122 26.6C55.7943 27.9317 56.6244 29.1943 56.9876 30.5606C57.8005 33.7256 57.4546 36.735 55.9153 39.5022C55.4311 40.367 54.7911 41.1798 54.1512 41.9581C52.8368 43.6012 51.4705 45.2961 51.4186 47.7001C51.384 49.0491 52.0585 50.2771 53.2173 50.9862C53.8399 51.3667 54.5663 51.5742 55.2927 51.5742C55.6213 51.5742 55.9672 51.5223 56.2958 51.4532C56.5898 51.3667 56.8839 51.2629 57.1606 51.1073C57.2471 51.0554 57.3335 51.0035 57.42 50.9516C57.3681 51.3667 57.3508 51.7991 57.3681 52.2142C57.3681 52.3179 57.3854 52.439 57.3854 52.5428C57.4373 53.2519 57.5411 53.9783 57.593 54.6874C57.6794 55.604 57.8351 55.7078 57.5584 56.6071C57.2298 57.6448 55.8289 58.2675 54.3761 58.5961C53.4594 58.8036 52.2142 58.9939 51.2456 59.1149C50.3809 59.236 49.741 59.9451 49.6891 60.8098C49.568 62.9372 49.395 66.7075 49.5507 67.7625C49.6545 68.9386 50.3463 69.9244 51.4013 70.4433ZM71.2216 4.98102C71.2216 5.96684 70.8584 7.00455 69.2672 6.93537C69.2672 6.93537 68.8521 6.20898 67.6588 5.01561C67.6415 5.01561 69.6304 5.4134 71.2216 4.98102ZM67.7106 19.8203C68.1084 20.5986 68.5235 21.3596 68.9732 22.0859C69.4402 22.8123 69.9417 23.4869 70.4952 24.1441C70.9794 24.7321 71.4983 25.3374 71.9999 25.9255C71.4291 25.9601 70.8584 26.0811 70.253 26.2887C69.9763 25.8217 69.6996 25.3547 69.4229 24.8878C68.9732 24.1268 68.5581 23.3139 68.1949 22.4837C67.849 21.6536 67.555 20.8234 67.2956 19.9759C67.0188 19.1458 66.7767 18.2983 66.5346 17.4508C66.9324 18.2464 67.3129 19.042 67.7106 19.8203ZM65.0472 25.4758C64.4764 24.317 63.9403 23.141 63.4906 21.9303C63.0236 20.7196 62.6432 19.4744 62.3318 18.2291C62.0378 16.9666 61.8303 15.704 61.7092 14.4242C61.9859 15.6694 62.3318 16.8974 62.7642 18.0908C63.1966 19.2841 63.7155 20.4429 64.2862 21.5671C65.3585 23.6252 66.6383 25.5796 67.9701 27.4993C67.3993 27.8279 66.8805 28.0528 66.4481 28.1911C65.9638 27.2918 65.4969 26.3924 65.0472 25.4758ZM97.7524 5.11938H98.9457C99.2571 6.1225 99.7586 6.96996 100.381 7.59259H102.803C102.197 7.24669 101.644 6.67595 101.211 5.91496C100.554 4.79077 100.174 3.35527 100.156 1.86789H96.732C96.7147 3.35527 96.3342 4.79077 95.6769 5.91496C95.2273 6.67595 94.6911 7.24669 94.0858 7.59259H96.3515C96.9395 6.96996 97.4411 6.1225 97.7524 5.11938ZM90.7651 7.59259H91.0245C90.4192 7.24669 89.8658 6.67595 89.4334 5.91496C88.7762 4.79077 88.3957 3.35527 88.3784 1.86789H85.6976C85.6803 2.02354 85.6803 2.1792 85.6803 2.35215C85.6457 5.18856 87.9979 7.59259 90.7651 7.59259ZM109.686 5.11938H110.879C111.191 6.1225 111.692 6.96996 112.315 7.59259H114.892C114.287 7.24669 113.75 6.67595 113.301 5.91496C112.644 4.79077 112.263 3.35527 112.246 1.86789H108.51C108.493 3.35527 108.112 4.79077 107.455 5.91496C107.005 6.67595 106.469 7.24669 105.864 7.59259H108.285C108.873 6.96996 109.375 6.1225 109.686 5.11938ZM66.3616 70.6162C66.6902 70.4087 67.0361 70.2011 67.4166 69.9936C67.3302 69.959 67.261 69.9244 67.1745 69.9071C67.0015 69.8379 66.8459 69.7688 66.6902 69.6996C65.5487 69.2499 64.6494 68.9905 63.9057 68.8694C63.9057 68.9386 63.923 68.9905 63.923 69.0597L64.1132 70.8584L62.4356 70.1665L62.3664 70.1492C62.2454 70.3741 62.107 70.5643 61.9513 70.7373C61.519 71.187 60.9482 71.4291 60.3083 71.4291C60.5158 71.7404 60.6542 72.0863 60.7407 72.4495C61.0001 73.591 60.5677 74.8362 59.5646 75.9431L58.8382 76.7387L58.0426 76.0296L57.2989 75.3724C57.1952 75.3897 57.0914 75.3897 56.9876 75.3897C55.9326 75.3897 54.9987 74.5595 54.7047 73.7466C54.6701 73.6429 54.6355 73.5391 54.6182 73.4353C54.5144 73.5218 54.3934 73.6083 54.2896 73.6775L54.1685 74.8535L54.0475 76.1161L52.8195 75.8048C51.9029 75.5799 50.6057 75.113 50.0177 73.8677C49.741 73.2797 49.6718 72.6225 49.7928 71.8788C47.1121 71.5675 45.0021 70.8584 45.0021 70.8584C46.5413 75.4762 50.917 78.0704 55.1543 78.0704C57.6276 78.0704 60.0489 77.1884 61.813 75.2859C62.2454 74.8362 62.6259 74.4039 63.0064 74.0234C63.5944 72.8127 64.7186 71.6712 66.3616 70.6162ZM121.81 5.11938H123.003C123.315 6.1225 123.816 6.96996 124.439 7.59259H126.808C126.203 7.24669 125.649 6.67595 125.217 5.91496C124.56 4.79077 124.179 3.35527 124.162 1.86789H120.617C120.599 3.35527 120.219 4.79077 119.562 5.91496C119.112 6.67595 118.576 7.22939 117.97 7.59259H120.392C120.997 6.96996 121.499 6.1225 121.81 5.11938ZM80.0767 19.4398C80.682 20.2354 81.1836 21.1347 81.5641 22.0687L83.5184 20.2008C83.3109 19.6646 83.2417 19.042 83.3109 18.4021C83.3109 18.3675 83.3282 18.3329 83.3282 18.281L84.3659 18.7826C84.3313 19.5609 84.6253 20.3737 85.3344 20.7542C85.5593 20.8753 85.7495 20.9272 86.0089 20.9272C86.0089 20.9272 86.0089 20.9272 86.0262 20.9272L85.9917 19.9759C86.3376 19.9759 86.8045 19.6127 86.8045 19.1112C86.8045 18.5404 86.4413 18.2291 85.9917 18.0908V16.9839C86.8564 17.1395 87.4963 17.6584 87.7558 18.3675L88.8972 18.3848C88.9491 17.52 88.534 16.7417 87.652 16.4477V15.3235C88.3957 15.4792 88.8799 15.8424 89.174 16.171C89.2604 16.2575 89.3296 16.3612 89.4161 16.465L90.2809 16.4823C90.3154 15.6521 89.9004 14.9085 89.1221 14.649V13.5248C89.6063 13.6286 90.0214 13.8189 90.3846 14.1302H91.1975C91.1802 13.594 90.8689 13.0752 90.4365 12.7466C90.0733 12.4871 89.6063 12.3315 89.1394 12.2623C88.9664 12.245 88.7762 12.2277 88.6032 12.2277C88.413 12.2277 88.24 12.245 88.0498 12.2796C87.5828 12.3488 87.1158 12.539 86.718 12.7984C86.0262 13.2654 85.369 13.8016 84.7291 14.3377C83.6914 15.2025 82.6883 16.1191 81.5987 16.932C81.2528 17.1914 80.1978 17.987 79.3676 18.6269C79.627 18.9036 79.8519 19.1631 80.0767 19.4398ZM80.682 11.2765C80.8377 10.4463 80.4226 9.84096 79.6097 9.65072C79.5751 9.65072 79.5405 9.63342 79.506 9.63342C79.6962 10.3425 79.6097 11.1208 79.1428 11.8818C78.7969 12.4179 78.2607 12.833 77.5862 13.0752C77.811 13.1098 78.0359 13.1098 78.2434 13.1098C79.6789 13.1098 80.4572 12.5217 80.682 11.2765Z",
          fill: "white"
        }), jsxRuntimeExports.jsx("path", {
          d: "M66.5691 89.1393C65.2201 89.1393 64.217 89.6582 63.5598 90.6959C62.9544 89.6582 62.0205 89.1393 60.7753 89.1393C59.53 89.1393 58.5961 89.6236 57.9734 90.5748V89.3988H55.8461V99.2051H57.9734V93.7053C57.9734 92.8578 58.181 92.2179 58.5788 91.7682C58.9766 91.3358 59.5127 91.111 60.1526 91.111C60.7407 91.111 61.1903 91.3012 61.5189 91.6644C61.8476 92.0449 62.0032 92.5638 62.0032 93.2383V99.1878H64.1305V93.688C64.1305 92.8232 64.3208 92.1833 64.7013 91.7509C65.0818 91.3185 65.6006 91.111 66.2578 91.111C66.8459 91.111 67.3128 91.3012 67.6587 91.6644C68.0046 92.0449 68.1776 92.5638 68.1776 93.2383V99.1878H70.3049V93.0999C70.3049 91.8893 69.959 90.9207 69.2845 90.1943C68.5754 89.5025 67.676 89.1393 66.5691 89.1393Z",
          fill: "#CC0000"
        }), jsxRuntimeExports.jsx("path", {
          d: "M180.06 89.1393C178.676 89.1393 177.656 89.6409 177.016 90.644V85.4555H174.889V99.1878H177.016V93.9301C177.016 92.9789 177.241 92.2698 177.708 91.8028C178.158 91.3358 178.763 91.111 179.507 91.111C180.181 91.111 180.717 91.3012 181.115 91.699C181.513 92.0968 181.703 92.6502 181.703 93.3939V99.2051H183.83V93.1864C183.83 91.9238 183.484 90.938 182.793 90.2289C182.084 89.5025 181.184 89.1393 180.06 89.1393Z",
          fill: "#CC0000"
        }), jsxRuntimeExports.jsx("path", {
          d: "M36.1988 94.1203H40.7993C40.5918 95.0716 40.1075 95.8326 39.3292 96.4033C38.5683 96.9741 37.5651 97.2508 36.3545 97.2508C34.8325 97.2508 33.6045 96.7838 32.6706 95.8499C31.7367 94.9159 31.2697 93.7572 31.2697 92.3389C31.2697 90.9207 31.7367 89.7447 32.6706 88.8107C33.6045 87.8768 34.7806 87.3925 36.2161 87.3925C37.0982 87.3925 37.911 87.6001 38.6374 87.9979C39.3638 88.3956 39.9 88.9318 40.2632 89.5717L41.8198 87.8941C41.2663 87.1677 40.5745 86.5451 39.727 86.0781C38.672 85.4901 37.496 85.196 36.2161 85.196C34.1753 85.196 32.4631 85.8878 31.0794 87.2715C29.6958 88.6551 29.004 90.3327 29.004 92.3216C29.004 94.3279 29.6958 96.0055 31.0794 97.3891C32.4631 98.7555 34.2099 99.4473 36.3372 99.4473C38.3434 99.4473 39.9692 98.8419 41.1971 97.6486C42.4424 96.4552 43.065 94.9159 43.065 93.0307V92.1141H36.1988V94.1203Z",
          fill: "#CC0000"
        }), jsxRuntimeExports.jsx("path", {
          d: "M191.233 91.4396V89.3988H188.794V86.6488H186.667V89.3988H184.868V91.4396H186.667V96.1439C186.667 97.4237 187.013 98.3058 187.722 98.79C188.431 99.2743 189.59 99.4127 191.215 99.2051V97.3027C190.679 97.3373 190.23 97.3372 189.866 97.32C189.503 97.3027 189.226 97.1989 189.054 97.0259C188.863 96.853 188.777 96.559 188.777 96.1439V91.4396C188.777 91.4396 191.233 91.4396 191.233 91.4396Z",
          fill: "#CC0000"
        }), jsxRuntimeExports.jsx("path", {
          d: "M49.4642 89.1393C47.9422 89.1393 46.697 89.6409 45.7285 90.6267C44.7772 91.6126 44.293 92.8405 44.293 94.3106C44.293 95.798 44.7772 97.0432 45.7631 98.0118C46.7489 98.9803 48.0287 99.4819 49.6372 99.4819C51.3321 99.4819 52.6638 98.8938 53.6151 97.7523L52.1796 96.3168C51.6088 97.1297 50.7787 97.5275 49.6545 97.5275C48.8416 97.5275 48.1498 97.32 47.5963 96.9222C47.0256 96.5244 46.6797 95.9536 46.524 95.21H54.3415C54.3933 94.8468 54.4279 94.5527 54.4279 94.3279C54.4279 92.8924 53.961 91.6644 53.0443 90.6613C52.0931 89.6409 50.8997 89.1393 49.4642 89.1393ZM46.4895 93.4804C46.6278 92.7367 46.9737 92.1487 47.4926 91.7163C48.0114 91.2839 48.6686 91.0764 49.4469 91.0764C50.1387 91.0764 50.7441 91.2839 51.2629 91.6817C51.7818 92.0795 52.1104 92.6849 52.2487 93.4804H46.4895Z",
          fill: "#CC0000"
        }), jsxRuntimeExports.jsx("path", {
          d: "M76.9117 89.1393C75.3897 89.1393 74.1445 89.6409 73.1759 90.6267C72.2074 91.6126 71.7231 92.8405 71.7231 94.3106C71.7231 95.798 72.2074 97.0432 73.1932 98.0118C74.1791 98.9803 75.4589 99.4819 77.0674 99.4819C78.7623 99.4819 80.094 98.8938 81.0452 97.7523L79.6097 96.3168C79.039 97.1297 78.2088 97.5275 77.0846 97.5275C76.2718 97.5275 75.58 97.32 75.0265 96.9222C74.4558 96.5244 74.1099 95.9536 73.9542 95.21H81.7716C81.8235 94.8468 81.8581 94.5527 81.8581 94.3279C81.8581 92.8924 81.3911 91.6644 80.4745 90.6613C79.5233 89.6409 78.3472 89.1393 76.9117 89.1393ZM73.9196 93.4804C74.058 92.7367 74.4039 92.1487 74.9227 91.7163C75.4416 91.2839 76.0988 91.0764 76.8771 91.0764C77.5689 91.0764 78.1742 91.2839 78.6931 91.6817C79.212 92.0795 79.5406 92.6849 79.6789 93.4804H73.9196Z",
          fill: "#CC0000"
        }), jsxRuntimeExports.jsx("path", {
          d: "M87.9806 89.1393C86.4586 89.1393 85.2133 89.6409 84.2448 90.6267C83.2763 91.6126 82.792 92.8405 82.792 94.3106C82.792 95.798 83.2763 97.0432 84.2621 98.0118C85.2479 98.9803 86.5278 99.4819 88.1362 99.4819C89.8311 99.4819 91.1629 98.8938 92.1141 97.7523L90.6786 96.3168C90.1079 97.1297 89.2777 97.5275 88.1535 97.5275C87.3406 97.5275 86.6488 97.32 86.0954 96.9222C85.5246 96.5244 85.1787 95.9536 85.0231 95.21H92.8405C92.8924 94.8468 92.927 94.5527 92.927 94.3279C92.927 92.8924 92.46 91.6644 91.5434 90.6613C90.6094 89.6409 89.4333 89.1393 87.9806 89.1393ZM85.0058 93.4804C85.1441 92.7367 85.49 92.1487 86.0089 91.7163C86.5278 91.2839 87.185 91.0764 87.9633 91.0764C88.6551 91.0764 89.2604 91.2839 89.7793 91.6817C90.2981 92.0795 90.6267 92.6849 90.7651 93.4804H85.0058Z",
          fill: "#CC0000"
        }), jsxRuntimeExports.jsx("path", {
          d: "M116.777 89.1393C115.255 89.1393 114.01 89.6409 113.041 90.6267C112.073 91.6126 111.589 92.8405 111.589 94.3106C111.589 95.798 112.073 97.0432 113.059 98.0118C114.044 98.9803 115.324 99.4819 116.933 99.4819C118.628 99.4819 119.959 98.8938 120.911 97.7523L119.475 96.3168C118.904 97.1297 118.074 97.5275 116.95 97.5275C116.137 97.5275 115.445 97.32 114.892 96.9222C114.321 96.5244 113.975 95.9536 113.82 95.21H121.637C121.689 94.8468 121.723 94.5527 121.723 94.3279C121.723 92.8924 121.257 91.6644 120.34 90.6613C119.406 89.6409 118.213 89.1393 116.777 89.1393ZM113.802 93.4804C113.941 92.7367 114.287 92.1487 114.805 91.7163C115.324 91.2839 115.981 91.0764 116.76 91.0764C117.452 91.0764 118.057 91.2839 118.576 91.6817C119.095 92.0795 119.423 92.6849 119.562 93.4804H113.802Z",
          fill: "#CC0000"
        }), jsxRuntimeExports.jsx("path", {
          d: "M158.199 89.1393C156.677 89.1393 155.432 89.6409 154.463 90.6267C153.495 91.6126 153.01 92.8405 153.01 94.3106C153.01 95.798 153.495 97.0432 154.481 98.0118C155.466 98.9803 156.746 99.4819 158.355 99.4819C160.05 99.4819 161.381 98.8938 162.333 97.7523L160.897 96.3168C160.326 97.1297 159.496 97.5275 158.372 97.5275C157.559 97.5275 156.867 97.32 156.314 96.9222C155.743 96.5244 155.397 95.9536 155.242 95.21H163.059C163.111 94.8468 163.145 94.5527 163.145 94.3279C163.145 92.8924 162.678 91.6644 161.762 90.6613C160.828 89.6409 159.652 89.1393 158.199 89.1393ZM155.224 93.4804C155.363 92.7367 155.708 92.1487 156.227 91.7163C156.746 91.2839 157.403 91.0764 158.182 91.0764C158.873 91.0764 159.479 91.2839 159.998 91.6817C160.517 92.0795 160.845 92.6849 160.984 93.4804H155.224Z",
          fill: "#CC0000"
        }), jsxRuntimeExports.jsx("path", {
          d: "M108.337 86.6488H106.21V89.3988H104.411V91.4396H106.21V96.1439C106.21 97.4237 106.556 98.3058 107.265 98.79C107.974 99.2743 109.133 99.4127 110.758 99.2051V97.3027C110.222 97.3373 109.772 97.3372 109.409 97.32C109.046 97.3027 108.769 97.1989 108.596 97.0259C108.406 96.853 108.32 96.559 108.32 96.1439V91.4396H110.758V89.3988H108.32L108.337 86.6488C108.337 86.6488 108.32 86.6488 108.337 86.6488Z",
          fill: "#CC0000"
        }), jsxRuntimeExports.jsx("path", {
          d: "M135.819 94.5181C135.819 95.3483 135.577 96.0228 135.075 96.5244C134.591 97.0259 133.847 97.2681 132.862 97.2681C131.876 97.2681 131.149 97.0259 130.648 96.5244C130.164 96.0228 129.904 95.3656 129.904 94.5181V85.4728H127.638V94.6565C127.638 96.1266 128.123 97.2854 129.091 98.1674C130.06 99.0322 131.305 99.4646 132.844 99.4646C134.384 99.4646 135.629 99.0322 136.597 98.1674C137.566 97.3027 138.05 96.1266 138.05 94.6565V85.4728H135.785V94.5181H135.819Z",
          fill: "#CC0000"
        }), jsxRuntimeExports.jsx("path", {
          d: "M143.36 86.6488H141.232V89.3988H139.434V91.4396H141.232V96.1439C141.232 97.4237 141.578 98.3058 142.287 98.79C142.996 99.2743 144.155 99.4127 145.781 99.2051V97.3027C145.245 97.3373 144.795 97.3372 144.432 97.32C144.069 97.3027 143.792 97.1989 143.619 97.0259C143.429 96.853 143.342 96.559 143.342 96.1439V91.4396H145.781V89.3988H143.342V86.6488H143.36Z",
          fill: "#CC0000"
        }), jsxRuntimeExports.jsx("path", {
          d: "M99.6029 89.1393C98.2193 89.1393 97.1989 89.6409 96.559 90.644V89.3815H94.4316V99.1878H96.559V93.9301C96.559 92.9789 96.7838 92.2698 97.2508 91.8028C97.7004 91.3358 98.3058 91.111 99.0495 91.111C99.724 91.111 100.26 91.3012 100.658 91.699C101.056 92.0968 101.246 92.6503 101.246 93.394V99.2051H103.373V93.1864C103.373 91.9239 103.027 90.938 102.336 90.2289C101.626 89.5025 100.727 89.1393 99.6029 89.1393Z",
          fill: "#CC0000"
        }), jsxRuntimeExports.jsx("path", {
          d: "M149.655 91.0418V89.3987H147.528V99.2051H149.655V94.2587C149.655 93.2556 149.949 92.5292 150.555 92.0968C151.16 91.6644 151.869 91.4742 152.682 91.5261V89.2258C151.195 89.2258 150.191 89.8311 149.655 91.0418Z",
          fill: "#CC0000"
        }), jsxRuntimeExports.jsx("path", {
          d: "M172.122 95.798C171.672 96.7319 170.807 97.3546 169.752 97.5102C169.735 97.5102 169.718 97.5102 169.7 97.5102C169.562 97.5275 169.406 97.5448 169.251 97.5448C167.521 97.5448 166.189 96.2131 166.189 94.3106C166.189 92.4081 167.521 91.0764 169.251 91.0764C169.406 91.0764 169.545 91.0937 169.683 91.111C169.7 91.111 169.718 91.111 169.735 91.111C170.79 91.2494 171.637 91.872 172.104 92.7713L173.522 91.3531C172.589 90.0041 171.032 89.1566 169.251 89.1566C166.38 89.1566 164.097 91.405 164.097 94.3279C164.097 97.2335 166.38 99.4819 169.251 99.4819C171.049 99.4819 172.606 98.5998 173.54 97.2508L172.122 95.798Z",
          fill: "#CC0000"
        }), jsxRuntimeExports.jsx("path", {
          d: "M110.274 13.0405C111.974 13.0405 113.353 12.3514 113.353 11.5013C113.353 10.6512 111.974 9.96201 110.274 9.96201C108.574 9.96201 107.196 10.6512 107.196 11.5013C107.196 12.3514 108.574 13.0405 110.274 13.0405Z",
          fill: "#CC0000"
        }), jsxRuntimeExports.jsx("path", {
          d: "M101.471 11.5013L98.0118 9.75447L94.5355 11.5013L98.0118 13.2308L101.471 11.5013Z",
          fill: "#CC0000"
        }), jsxRuntimeExports.jsx("path", {
          d: "M126.013 11.5013L122.536 9.75447L119.077 11.5013L122.536 13.2308L126.013 11.5013Z",
          fill: "#CC0000"
        }), jsxRuntimeExports.jsx("path", {
          d: "M175.183 69.8206C175.148 69.8379 173.125 70.4951 170.565 70.7892C171.395 70.0801 171.949 69.0769 172.122 67.9355C172.243 67.0707 172.208 64.6494 171.983 60.7753C171.914 59.3916 170.859 58.2502 169.493 58.0772C168.213 57.9043 167.158 57.7313 166.449 57.5756C164.979 57.247 164.183 56.7109 164.079 56.3304C163.941 55.9153 163.958 55.8634 164.01 55.4829C164.028 55.31 164.062 55.1024 164.097 54.8257C164.131 54.5144 164.149 54.2204 164.2 53.8918C164.252 53.494 164.287 53.0789 164.322 52.6638C164.322 52.6465 164.322 52.6119 164.322 52.5946C164.65 52.6638 164.996 52.6984 165.325 52.6984C166.241 52.6984 167.158 52.4563 167.954 51.9547C169.441 51.0381 170.306 49.4642 170.271 47.7174C170.202 44.9502 168.663 43.0131 167.296 41.3182C166.674 40.5399 166.068 39.7962 165.636 39.0179C164.235 36.4928 163.906 33.7602 164.667 30.8719C164.979 29.6785 165.757 28.4852 166.587 27.2399C166.76 26.9805 166.933 26.7038 167.106 26.4443C167.227 26.4616 167.348 26.4789 167.469 26.4789C167.988 26.4789 168.42 26.306 168.732 26.1157C170.721 24.8878 171.413 20.8753 171.378 18.6269C171.326 13.9226 169.475 10.5328 165.757 8.26709L164.477 7.48881L164.961 8.90702C166.086 12.1758 166.691 14.1993 165.982 17.4854C165.757 18.5404 165.307 19.5436 164.875 20.5121C164.2 22.0341 163.543 23.5041 164.114 24.6975C163.976 24.9051 163.837 25.1299 163.699 25.3374C162.748 26.7729 161.762 28.2603 161.312 30.0244C160.344 33.7602 160.793 37.4614 162.609 40.7301C163.18 41.7679 163.906 42.6672 164.598 43.532C165.757 44.9848 166.777 46.23 166.812 47.8385C166.829 48.513 166.397 48.8762 166.155 49.0318C165.671 49.3258 165.1 49.3431 164.598 49.0837C164.2 48.8762 163.82 48.4611 163.578 47.9768C163.197 46.8526 162.713 45.6766 162.056 44.3794C161.468 43.2034 160.828 42.0446 160.205 40.9204C159.064 38.845 157.974 36.8906 157.179 34.7633C156.573 33.1203 156.504 31.2351 156.539 30.0244C157.403 30.1801 158.164 30.2147 158.303 30.2147L159.427 30.2493L159.41 29.1251C159.392 28.2776 160.067 26.8075 160.828 25.0953C162.921 20.4602 166.086 13.4729 162.021 5.46528C161.987 5.41339 161.969 5.34421 161.935 5.29232C162.108 4.73888 162.16 4.23732 162.142 3.82223C162.125 2.28296 161.364 1.0723 160.672 0.449675L160.188 0.0172952L159.583 0.224837C159.185 0.363199 158.804 0.605331 158.424 0.899349C158.164 0.657217 157.836 0.484265 157.455 0.432379C157.352 0.415084 157.248 0.415084 157.109 0.415084C155.432 0.415084 149.327 1.7987 148.531 2.21378L148.116 2.42132L147.978 2.871L147.684 3.89142C146.335 4.34109 145.107 5.0156 144.19 5.51716C144.069 5.58634 143.948 5.65552 143.827 5.70741L143.135 6.0879L143.291 6.86619C143.308 6.98725 143.913 10.0312 145.677 12.0893L145.764 12.1758C145.331 12.2104 144.951 12.245 144.605 12.245C143.55 12.245 142.72 11.9337 142.322 11.311C141.699 10.3425 142.149 9.30481 142.876 8.76865C142.478 8.5957 142.097 8.49193 141.63 8.49193C141.354 8.49193 141.042 8.52652 140.696 8.613C139.313 8.92431 138.534 10.0831 138.794 11.484C139.088 13.1616 140.264 14.1993 142.305 14.1993C142.72 14.1993 143.152 14.1647 143.636 14.0783C144.328 13.9572 145.037 13.7497 145.746 13.5248C145.746 13.5594 145.729 13.5767 145.729 13.6113C145.556 14.5798 145.401 15.41 145.937 16.0845C144.449 16.3612 143.1 16.9839 141.959 17.9178C141.025 17.2087 139.762 16.2575 139.572 16.1018C138.828 15.5484 138.137 14.943 137.393 14.3204C137.099 14.061 136.788 13.8016 136.476 13.5421C135.836 13.006 135.145 12.4525 134.401 11.9337C133.847 11.5532 133.208 11.311 132.516 11.2246V8.16332C134.712 7.19479 136.251 4.96372 136.251 2.42132C136.251 1.85058 136.182 1.31443 136.027 0.795578H131.374C131.409 1.10689 131.426 1.4182 131.426 1.74681C131.426 4.51404 130.042 6.95266 128.33 6.95266C126.618 6.95266 125.234 4.51404 125.234 1.74681C125.234 1.4182 125.252 1.10689 125.286 0.795578H119.458C119.492 1.10689 119.51 1.4182 119.51 1.74681C119.51 4.51404 118.126 6.95266 116.414 6.95266C114.702 6.95266 113.318 4.51404 113.318 1.74681C113.318 1.4182 113.335 1.10689 113.37 0.795578H107.351C107.386 1.10689 107.403 1.4182 107.403 1.74681C107.403 4.51404 106.019 6.95266 104.307 6.95266C102.595 6.95266 101.211 4.51404 101.211 1.74681C101.211 1.4182 101.229 1.10689 101.263 0.795578H95.5732C95.6078 1.10689 95.6251 1.4182 95.6251 1.74681C95.6251 4.51404 94.2415 6.95266 92.5292 6.95266C90.817 6.95266 89.4334 4.51404 89.4334 1.74681C89.4334 1.4182 89.4507 1.10689 89.4853 0.795578H84.7637C84.6253 1.29714 84.5562 1.81599 84.5562 2.35214C84.5562 4.80806 85.9917 7.00455 88.0498 8.04226V11.2246C87.358 11.311 86.6835 11.5532 86.1127 11.951C85.369 12.4525 84.6772 13.0233 84.0373 13.5594C83.726 13.8188 83.432 14.0783 83.1207 14.3377C82.377 14.9603 81.6852 15.5657 80.9415 16.1191C80.7512 16.2575 79.4887 17.2087 78.5547 17.9351C77.4132 17.0012 76.0815 16.3785 74.5768 16.1018C75.113 15.41 74.9573 14.5798 74.7844 13.6286C74.7844 13.6113 74.7671 13.5767 74.7671 13.5421C75.4762 13.7843 76.1853 13.9745 76.8771 14.0956C77.3614 14.182 77.7937 14.2166 78.2088 14.2166C80.2497 14.2166 81.4257 13.1789 81.7197 11.5013C81.9792 10.1004 81.2009 8.94161 79.8173 8.63029C79.4714 8.56111 79.1601 8.50923 78.8833 8.50923C78.4164 8.50923 78.0359 8.613 77.6381 8.78595C78.3645 9.3221 78.8142 10.3598 78.1915 11.3283C77.7937 11.9683 76.9463 12.2623 75.9086 12.2623C75.5454 12.2623 75.1649 12.2277 74.7844 12.1585L74.8709 12.072C76.635 10.0139 77.2403 6.98725 77.2576 6.84889L77.4132 6.07061L76.7214 5.69011C76.6004 5.62093 76.4793 5.56905 76.3582 5.49987C75.4243 4.99831 74.2136 4.32379 72.8646 3.87412L72.5706 2.8537L72.4322 2.40403L72.0171 2.19649C71.2216 1.7814 65.1164 0.397789 63.4387 0.397789C63.3177 0.397789 63.1966 0.397789 63.0928 0.415084C62.7123 0.46697 62.3837 0.639922 62.1243 0.882054C61.7438 0.570741 61.346 0.345904 60.9655 0.207542L60.3602 0L59.8586 0.397789C59.1668 1.02042 58.4058 2.23108 58.3885 3.77035C58.3885 4.18543 58.4404 4.68699 58.5961 5.24044C58.5615 5.30962 58.5269 5.36151 58.5096 5.41339C54.4452 13.4211 57.6103 20.4083 59.703 25.0434C60.464 26.7383 61.1385 28.2084 61.1212 29.0732L61.1039 30.1974L62.2281 30.1628C62.3491 30.1628 63.1101 30.1282 63.9922 29.9725C64.0268 31.1832 63.9749 33.0857 63.3523 34.7114C62.5567 36.8387 61.4671 38.7931 60.3256 40.8685C59.703 41.9927 59.0631 43.1515 58.475 44.3275C57.8351 45.6247 57.3335 46.8008 56.953 47.9249C56.7109 48.4092 56.3477 48.8243 55.9326 49.0318C55.4311 49.2913 54.8603 49.274 54.3761 48.9799C54.1166 48.8243 53.7016 48.4611 53.7188 47.7866C53.7534 46.1954 54.7566 44.9329 55.9326 43.4801C56.6244 42.6153 57.3335 41.7333 57.9216 40.6783C59.7376 37.4095 60.1872 33.7083 59.2187 29.9725C58.769 28.2084 57.7832 26.7211 56.832 25.2856C56.6936 25.078 56.5553 24.8532 56.4169 24.6456C56.9876 23.4523 56.3477 21.9822 55.6559 20.4602C55.2235 19.4917 54.7739 18.4885 54.549 17.4335C53.8399 14.1302 54.4452 12.1239 55.5694 8.85513L56.0537 7.43693L54.7739 8.21521C51.0554 10.4809 49.2048 13.8707 49.1529 18.575C49.1183 20.8234 49.8274 24.8532 51.7991 26.0638C52.1104 26.2541 52.5255 26.427 53.0616 26.427C53.1827 26.427 53.2865 26.4097 53.4248 26.3924C53.5978 26.6519 53.7707 26.9286 53.9437 27.188C54.7739 28.4333 55.5521 29.6266 55.8634 30.82C56.6071 33.7083 56.2785 36.4582 54.8949 38.966C54.4625 39.7443 53.8745 40.488 53.2346 41.2663C51.8683 42.9612 50.329 44.881 50.2598 47.6655C50.2252 49.395 51.09 50.9862 52.5774 51.9028C53.3729 52.4044 54.2896 52.6465 55.2062 52.6465C55.5521 52.6465 55.8807 52.6119 56.2094 52.5427C56.2094 52.56 56.2094 52.5946 56.2094 52.6119C56.2439 53.027 56.2785 53.4421 56.3304 53.8399C56.365 54.1685 56.3996 54.4625 56.4342 54.7738C56.4515 55.0506 56.4861 55.2581 56.5207 55.4311C56.5726 55.7943 56.5898 55.8634 56.4515 56.2785C56.3304 56.659 55.5521 57.1952 54.082 57.5238C53.3729 57.6794 52.3179 57.8524 51.0381 58.0253C49.6718 58.2156 48.6168 59.3571 48.5476 60.7234C48.34 64.5975 48.2882 67.0188 48.4092 67.8836C48.5822 69.0251 49.1356 70.0282 49.9658 70.7373C47.4061 70.4433 45.3653 69.7687 45.348 69.7687L43.2899 69.0769L43.9817 71.1351C44.7945 73.5564 46.3338 75.5972 48.4611 77.0327C50.4328 78.3645 52.8022 79.0909 55.1543 79.0909C58.0253 79.0909 60.6369 78.0186 62.5221 76.0642C62.5394 76.6003 62.6432 77.1192 62.8507 77.6554L63.8019 80.0248L64.8569 77.7072C64.9261 77.5689 66.5346 74.179 70.3741 73.885C72.0171 73.7639 73.885 73.5218 75.3378 72.3111C75.3378 72.3111 75.3378 72.3111 75.3551 72.3111C75.3551 72.7089 75.3897 73.0894 75.4935 73.4699C76.0123 75.6145 77.8629 76.7041 77.9321 76.7387L79.6443 77.7245L79.5406 75.7529C79.506 74.9054 79.4541 73.9369 79.6962 73.1413C80.1286 71.7058 81.6333 71.1697 82.4807 70.9621C82.6883 70.9102 82.8958 70.8583 83.0861 70.8238C84.487 70.5124 85.6285 70.253 86.8045 69.5612C86.303 70.547 86.0954 71.5502 86.1992 72.5706C86.4413 75.113 88.5167 76.7041 88.6032 76.7733L90.9727 78.5547L90.3154 75.6664C90.0733 74.5595 89.8831 72.0344 90.9035 71.3772C92.166 70.547 93.1173 70.4433 94.2242 70.3222C95.1408 70.2184 96.1266 70.0974 97.2854 69.5958C96.3861 71.5847 96.7666 73.2105 96.8011 73.297L97.3546 75.4935L98.7209 73.6775C98.7382 73.6429 101.298 70.3395 104.93 70.3395C107.559 70.3395 109.686 71.6366 109.703 71.6539L110.274 71.9998L110.845 71.6539C110.862 71.6366 112.989 70.3395 115.618 70.3395C119.25 70.3395 121.81 73.6602 121.827 73.6775L123.194 75.4935L123.747 73.297C123.764 73.2105 124.162 71.5847 123.263 69.5958C124.422 70.0974 125.407 70.2184 126.324 70.3222C127.431 70.4433 128.399 70.5643 129.645 71.3772C130.665 72.0517 130.492 74.5595 130.233 75.6664L129.576 78.5547L131.945 76.7733C132.031 76.7041 134.107 75.113 134.349 72.5706C134.453 71.5502 134.245 70.547 133.744 69.5612C134.92 70.2357 136.061 70.4951 137.462 70.8238C137.652 70.8756 137.86 70.9102 138.067 70.9621C138.915 71.1524 140.42 71.7058 140.852 73.1413C141.094 73.9369 141.042 74.9054 141.008 75.7529L140.904 77.7245L142.616 76.7387C142.703 76.6868 144.553 75.6145 145.055 73.4699C145.141 73.0894 145.193 72.6916 145.193 72.3111C145.193 72.3111 145.193 72.3111 145.21 72.3111C146.663 73.5218 148.531 73.7466 150.174 73.885C154.014 74.179 155.622 77.5689 155.691 77.7072L156.746 80.0248L157.697 77.6554C157.905 77.1192 158.026 76.5831 158.026 76.0642C159.911 78.0186 162.523 79.0909 165.394 79.0909C167.746 79.0909 170.115 78.3645 172.087 77.0327C174.214 75.5972 175.771 73.5564 176.567 71.1351L177.258 69.0769L175.183 69.8206ZM142.287 13.1097C140.835 13.1097 140.074 12.5217 139.849 11.2765C139.693 10.4463 140.108 9.84096 140.921 9.65071C140.956 9.65071 140.99 9.63341 141.025 9.63341C140.835 10.3425 140.921 11.1208 141.388 11.8818C141.734 12.4179 142.27 12.833 142.945 13.0752C142.72 13.0924 142.495 13.1097 142.287 13.1097ZM79.1255 11.8818C79.6097 11.1381 79.6789 10.3425 79.4887 9.63341C79.5233 9.63341 79.5578 9.65071 79.5924 9.65071C80.4053 9.82366 80.8204 10.4463 80.6647 11.2765C80.4399 12.5217 79.6616 13.1097 78.2261 13.1097C78.0186 13.1097 77.7937 13.0924 77.5689 13.0752C78.2434 12.833 78.7796 12.4352 79.1255 11.8818ZM142.011 19.3014C142.27 19.042 142.547 18.7999 142.841 18.575C144.121 17.5892 145.746 16.9839 147.787 16.9839C148.081 16.9839 148.375 17.0012 148.687 17.0185L151.454 15.7559C150.468 15.7732 149.673 15.8078 149.033 15.8078C146.265 15.8078 146.49 15.4273 146.853 13.4902C146.853 13.4902 149.188 14.1302 150.97 14.1302C151.143 14.1302 151.316 14.1302 151.471 14.1129C152.336 14.0437 152.716 13.6632 152.855 13.1962C153.028 12.5736 153.08 11.6051 152.595 10.3944C152.284 9.59882 151.523 8.90702 150.434 8.90702C149.603 8.90702 148.6 9.30481 147.459 10.3425L146.49 11.311C145.989 10.723 145.591 10.0485 145.28 9.39128C145.072 8.49193 146.041 7.92119 146.041 7.92119C145.055 8.04226 144.57 7.02184 144.415 6.55487C145.47 5.98413 146.974 5.11937 148.566 4.68699L149.033 3.09584C149.638 2.78452 155.553 1.4182 157.109 1.4182C157.196 1.4182 157.248 1.4182 157.317 1.4355C157.438 1.45279 157.559 1.50468 157.646 1.57386C157.317 1.93706 157.023 2.35214 156.764 2.80182L157.819 3.14772C158.407 2.19649 159.219 1.40091 159.946 1.15878C160.897 1.98895 162.039 4.46216 159.531 7.05643V8.56111L159.963 8.14603C160.568 7.57529 161.001 7.02184 161.329 6.48569C166.12 16.8628 158.251 25.372 158.303 29.0386C158.303 29.0386 156.66 28.9867 155.536 28.537C155.536 28.537 155.034 32.1171 156.141 35.0573C157.421 38.4818 159.444 41.5257 161.07 44.7772C161.623 45.8841 162.108 47.0083 162.506 48.1671C162.523 48.2017 162.523 48.2363 162.54 48.2708C162.869 48.9799 163.422 49.6026 164.045 49.9485C164.062 49.9658 164.097 49.9658 164.114 49.9831C164.927 50.3981 165.878 50.3463 166.674 49.862C167.452 49.395 167.867 48.5995 167.85 47.7174C167.798 45.7457 166.639 44.293 165.394 42.7537C164.737 41.9235 164.045 41.076 163.509 40.1075C161.831 37.0809 161.416 33.6564 162.315 30.1974C162.73 28.6062 163.664 27.2053 164.564 25.839C164.771 25.5277 164.961 25.2337 165.169 24.9224C165.255 24.8013 165.325 24.6802 165.394 24.5592C164.961 24.1614 164.875 23.6771 165.013 23.0372C165.134 22.4491 165.446 21.74 165.826 20.858C166.259 19.8895 166.76 18.7826 167.002 17.6238C167.4 15.7559 167.4 14.2512 167.158 12.7638C167.521 13.3519 167.832 13.9745 168.092 14.6144C168.386 15.3408 168.593 16.1018 168.697 16.8974C168.801 17.693 168.801 18.5058 168.68 19.3187C168.957 18.5577 169.13 17.7276 169.181 16.8974C169.233 16.0499 169.181 15.2025 169.026 14.3723C168.887 13.6113 168.68 12.8503 168.403 12.1239C169.597 13.8707 170.202 15.998 170.236 18.5577C170.271 21.7746 169.164 24.4727 168.109 25.1126C167.971 25.1991 167.85 25.251 167.729 25.2856C167.279 25.3893 166.587 25.078 166.587 25.078C166.276 25.5969 165.965 26.0638 165.636 26.5654C164.754 27.8971 163.924 29.1597 163.561 30.526C162.748 33.691 163.094 36.7004 164.633 39.4676C165.117 40.3324 165.757 41.1452 166.397 41.9235C167.711 43.5666 169.078 45.2615 169.13 47.6655C169.164 49.0145 168.49 50.2425 167.331 50.9516C166.708 51.3321 165.982 51.5396 165.255 51.5396C164.927 51.5396 164.581 51.4877 164.252 51.4186C163.958 51.3321 163.664 51.2283 163.388 51.0727C163.301 51.0208 163.215 50.9689 163.128 50.917C163.18 51.3321 163.197 51.7645 163.18 52.1796C163.18 52.2833 163.163 52.4044 163.163 52.5082C163.111 53.2173 163.007 53.9437 162.955 54.6528C162.869 55.5694 162.713 55.6732 162.99 56.5725C163.318 57.6102 164.719 58.2329 166.172 58.5615C167.089 58.769 168.334 58.9593 169.303 59.0803C170.167 59.2014 170.807 59.9105 170.859 60.7753C170.98 62.9026 171.153 66.6729 170.997 67.7279C170.825 68.8867 170.15 69.8725 169.078 70.3914C169.147 70.547 169.216 70.7027 169.285 70.8411C169.441 71.2388 169.562 71.5847 169.614 71.9134C169.96 73.7985 168.611 74.3866 167.4 74.6806L167.244 72.9857C167.227 72.9165 166.899 72.7608 166.829 72.7262C166.726 72.657 166.604 72.5879 166.518 72.5014C166.31 72.3111 166.241 72.0863 166.207 71.8442C166.189 71.7058 166.189 71.5674 166.189 71.4118C166.172 71.1524 166.138 70.8929 165.999 70.7027C165.93 70.6162 165.861 70.547 165.74 70.4951C165.636 70.4433 165.532 70.426 165.428 70.426C165.307 70.426 165.204 70.4606 165.1 70.5124C164.875 70.6335 164.685 70.8583 164.65 71.1351C164.633 71.2388 164.65 71.3772 164.667 71.5156C164.754 72.0171 164.996 72.7089 164.771 73.3143C164.633 73.7121 164.097 74.2482 163.509 74.2482C163.318 74.2482 163.145 74.1963 162.955 74.0753L161.745 75.1476C160.136 73.3834 160.638 71.6885 162.384 70.9621C162.523 70.9102 162.644 70.8411 162.748 70.7719C163.076 70.547 163.267 70.253 163.076 69.9417C162.938 69.6996 162.782 69.6131 162.575 69.6131C162.263 69.6131 161.866 69.8033 161.26 70.0455C161.226 70.0628 161.191 70.0801 161.139 70.0974C160.811 70.2184 160.499 70.3049 160.205 70.3049C159.583 70.3049 159.081 69.9417 158.822 68.9386C158.804 68.8521 158.787 68.7483 158.77 68.6619L158.355 68.8348L157.628 69.1288C157.646 69.0078 157.663 68.8694 157.68 68.7483C157.749 68.3332 157.888 67.9874 158.043 67.6933C158.58 66.7075 159.531 66.3097 160.499 66.3097C161.745 66.3097 163.024 66.9323 163.561 67.7279L165.843 68.0392C166.31 67.4512 166.328 65.7217 166.259 64.3727C166.207 63.3868 165.48 62.5913 164.512 62.4356C162.851 62.1935 160.361 61.8303 159.479 61.7611C157.801 61.64 156.054 61.346 154.792 60.118C153.062 58.4058 152.682 56.6244 152.682 54.1512C152.682 53.3383 152.716 52.5255 152.786 51.6953C152.838 50.9862 152.924 50.2771 152.993 49.5853C153.045 49.1183 153.114 48.6513 153.183 48.1844C153.253 47.752 153.253 47.285 153.218 46.8353C153.201 46.6624 153.183 46.5067 153.149 46.3338C153.062 45.8322 152.924 45.348 152.734 44.8464C152.526 44.3275 152.232 43.8433 151.886 43.3763C151.333 42.6499 150.606 42.01 149.69 41.4911C149.361 41.3009 148.963 41.076 148.548 40.8166C148.133 40.5572 147.684 40.2805 147.217 39.9519C146.075 39.1909 144.813 38.2396 143.636 37.15C143.723 37.0982 143.809 37.0463 143.896 36.9944C144.328 36.735 145.522 35.8529 146.646 34.919C146.923 34.6941 147.165 34.4866 147.39 34.279L146.317 33.7083C145.072 34.7633 143.688 35.801 143.325 36.0086C143.152 36.1123 142.979 36.2161 142.806 36.3199C142.478 36.5101 142.149 36.7004 141.838 36.8733C140.022 37.911 138.725 38.6201 138.759 39.8308C141.008 42.2521 139.78 43.6876 138.534 44.12L138.119 42.7883C136.805 42.5634 136.822 41.5949 136.77 40.8512C136.736 40.4534 136.424 40.2286 136.113 40.2286C135.854 40.2286 135.594 40.4015 135.577 40.7993C135.542 41.2317 135.577 41.6814 135.456 42.3905C135.369 42.8747 134.851 43.532 134.107 43.532C133.986 43.532 133.865 43.5147 133.744 43.4801L133.467 45.0539C130.907 44.5697 131.184 42.0273 132.913 41.1625C133.899 40.661 134.211 40.2978 133.917 39.9173C133.83 39.8135 133.726 39.7616 133.605 39.7616C133.242 39.7616 132.706 40.1594 132.187 40.5399C131.962 40.7129 131.668 40.7993 131.357 40.7993C130.682 40.7993 129.956 40.3669 129.645 39.3465L128.763 39.8827C128.607 37.9629 129.8 37.0117 131.011 37.0117C131.582 37.0117 132.17 37.2192 132.619 37.6343C132.792 37.79 132.965 37.8591 133.138 37.8591C133.692 37.8591 134.072 37.1673 133.329 36.7695C132.619 36.3891 131.945 35.213 132.602 34.4693L131.53 33.4662C132.014 33.1722 132.533 33.0338 133.017 33.0338C134.09 33.0338 135.075 33.7256 135.387 35.2995C135.456 35.6627 135.612 35.801 135.819 35.801C136.407 35.801 137.445 34.5385 138.223 33.2932C138.413 32.9992 138.586 32.6879 138.759 32.3939C138.984 31.9961 139.226 31.6156 139.486 31.2351C139.814 30.7508 140.16 30.2839 140.593 29.8688C141.319 29.1424 142.581 27.8798 144.034 27.0324C144.38 26.8421 144.743 26.6519 145.107 26.4962C145.539 25.9255 145.971 25.3374 146.352 24.7321C147.372 23.1755 148.22 21.5152 148.704 19.7684C147.908 21.4114 146.802 22.8469 145.574 24.1268C145.003 24.7321 144.415 25.2855 143.792 25.839C142.115 26.7038 140.714 28.1047 139.883 28.9175L139.762 29.0386C139.52 29.2807 139.295 29.5229 139.105 29.7823C138.828 28.0874 138.898 25.9947 139.434 24.0057C139.538 23.6252 139.659 23.2274 139.797 22.8642C140.299 21.5498 141.025 20.3045 142.011 19.3014ZM148.479 12.4352C149.136 12.2104 149.794 12.0374 150.416 12.0374C150.935 12.0374 151.419 12.1585 151.869 12.4179C151.852 12.6255 151.817 12.7984 151.8 12.8849C151.8 12.9022 151.8 12.9022 151.8 12.9022C151.8 12.9022 151.713 12.9887 151.367 13.0233C151.246 13.0406 151.108 13.0406 150.952 13.0406C150.278 13.0406 149.517 12.9368 148.842 12.8157C148.168 12.712 147.147 12.4871 147.147 12.4871C147.044 11.9337 147.13 11.3456 147.338 11.3629C147.58 11.4148 147.753 12.0029 148.479 12.4352ZM147.77 11.5705L148.185 11.1381C149.223 10.2042 149.967 9.99661 150.399 9.99661C151.177 9.99661 151.488 10.6019 151.558 10.7922C151.627 10.9651 151.679 11.1381 151.731 11.2938C151.316 11.1035 150.866 11.0343 150.399 11.0343C149.569 11.0343 148.687 11.2938 147.77 11.5705ZM154.93 64.8915C153.65 65.7563 152.457 66.1714 151.194 66.1714C150.018 66.1714 148.877 65.8254 147.666 65.445C147.338 65.3412 147.009 65.2374 146.663 65.1509C146.127 64.9953 145.556 64.9261 144.986 64.9261C143.602 64.9261 142.409 65.3758 141.63 65.7736C141.717 65.4795 141.993 64.3727 141.993 63.5252C143.014 62.9545 143.723 62.1416 144.069 61.0866C144.588 59.5127 145.003 56.7282 144.588 53.7188C145.401 53.6151 146.559 53.4421 147.718 53.2519C148.981 53.0443 150.018 52.8368 150.779 52.6465C151.143 52.56 151.437 52.4736 151.696 52.3871C151.661 52.9924 151.644 53.5978 151.644 54.2031C151.644 55.7078 151.783 56.832 152.094 57.8178C152.474 58.9939 153.114 60.0143 154.065 60.9482C155.587 62.4529 157.628 62.7815 159.427 62.9026C160.067 62.9545 161.831 63.1793 164.373 63.5598C164.823 63.629 165.186 64.0095 165.204 64.4764C165.273 65.7217 165.221 66.4654 165.152 66.8805L164.149 66.7421C163.318 65.8427 161.9 65.2547 160.517 65.2547C158.77 65.2547 157.455 66.1714 156.867 67.7279C156.556 67.7625 156.21 67.8144 155.864 67.9009C156.521 66.8978 156.573 65.9638 156.591 65.8427L156.677 63.6809L154.93 64.8915ZM137.549 65.0818C137.445 64.9953 137.341 64.8915 137.255 64.7877C137.237 64.7532 137.22 64.7359 137.203 64.7013C136.978 64.3381 137.047 63.9576 137.099 63.5598C137.151 63.162 137.151 62.7642 136.788 62.5048C136.649 62.401 136.494 62.3491 136.338 62.3491C136.234 62.3491 136.148 62.3664 136.061 62.401C135.819 62.4875 135.594 62.695 135.508 62.9717C135.456 63.1101 135.456 63.3004 135.456 63.5252C135.456 63.7154 135.473 63.923 135.473 64.1305C135.473 64.4937 135.439 64.8915 135.283 65.2374C135.266 65.272 135.248 65.3066 135.231 65.3412C135.023 65.6871 134.47 66.1195 133.899 66.1195C133.64 66.1195 133.38 66.033 133.156 65.8082L131.651 66.7248C131.651 66.7248 131.634 66.7248 131.634 66.7075C131.53 66.5519 131.461 66.3962 131.374 66.2578C131.201 65.8946 131.08 65.566 131.011 65.2374C130.734 63.7846 131.599 62.7296 133.121 62.3837C133.744 62.2454 134.245 61.9167 134.055 61.4152C133.934 61.0866 133.726 60.9655 133.415 60.9655C133.086 60.9655 132.619 61.0866 131.98 61.2249C131.772 61.2595 131.582 61.2941 131.392 61.3287C131.236 61.346 131.08 61.3633 130.942 61.3633C130.267 61.3633 129.835 61.0347 129.835 59.6857L128.538 59.9624C129.126 57.9043 130.319 57.1087 131.564 57.1087C132.844 57.1087 134.193 57.9561 135.023 59.1149L135.542 59.2879L136.459 59.5992L138.292 60.2218C140.074 58.7171 139.261 54.7565 139.261 54.7565C139.261 54.7565 135.784 52.8022 136.943 48.4611C136.943 48.4611 137.549 44.3794 144.986 44.3794C145.781 44.3794 146.646 44.4313 147.597 44.5351C148.168 44.6043 148.687 44.6734 149.154 44.7599C149.154 44.7599 149.154 44.7772 149.171 44.7772C148.998 45.175 148.946 45.6247 149.033 46.0571C149.154 46.7316 149.569 47.3023 150.174 47.6136C150.468 47.7693 150.797 47.8558 151.143 47.8558C151.523 47.8558 151.886 47.752 152.232 47.5617C152.232 47.752 152.215 47.9249 152.198 48.0979C152.059 49.0664 151.921 50.1041 151.834 51.1937C150.33 51.9547 143.36 52.8195 143.36 52.8195C144.034 56.1056 143.602 59.2187 143.083 60.7753C142.893 61.346 142.564 61.7957 142.149 62.1589C141.82 62.4529 141.44 62.6777 141.008 62.8507C140.921 63.9922 140.835 64.8396 140.627 65.5141C140.575 65.7563 140.489 65.9638 140.385 66.1368C139.866 67.0188 138.794 67.2264 137.825 67.2955L137.981 65.4623C137.929 65.3585 137.618 65.1336 137.549 65.0818ZM140.022 39.5541C140.316 39.0871 141.302 38.551 142.322 37.9629C142.443 37.8937 142.581 37.8246 142.72 37.7381C142.91 37.911 143.1 38.084 143.291 38.2569C143.758 38.672 144.242 39.0698 144.726 39.4503L144.743 39.4676L147.13 41.9581C147.753 42.6153 148.185 43.1169 148.479 43.532L145.003 43.2898C143.291 43.2898 141.907 43.4974 140.783 43.826C140.938 43.5838 141.06 43.3071 141.129 43.0304C141.405 41.716 140.765 40.488 140.022 39.5541ZM149.897 43.7914C149.69 43.3936 149.361 42.892 148.808 42.2175C148.946 42.304 149.102 42.3905 149.223 42.4597C150.053 42.9266 150.676 43.4974 151.143 44.12C151.506 44.6043 151.748 45.1231 151.938 45.6247C152.007 45.8149 152.059 46.0225 152.094 46.2127C151.886 46.5413 151.523 46.7489 151.143 46.7489C150.987 46.7489 150.831 46.7143 150.676 46.6278C150.105 46.3338 149.88 45.5728 150.278 44.9848C150.312 44.9329 150.347 44.881 150.399 44.8291C150.226 44.5351 150.105 44.2065 149.897 43.7914ZM133.778 12.833C134.47 13.3 135.127 13.8361 135.767 14.3723C136.805 15.2371 137.808 16.1537 138.898 16.9666C139.244 17.226 140.299 18.0216 141.129 18.6615C140.887 18.9209 140.662 19.1804 140.437 19.4571C139.832 20.2527 139.33 21.152 138.949 22.0859L136.995 20.2354C137.203 19.6992 137.272 19.0766 137.203 18.4367C137.203 18.4021 137.185 18.3675 137.185 18.3156L136.148 18.8172C136.182 19.5954 135.888 20.4083 135.179 20.7888C134.954 20.9099 134.764 20.9618 134.505 20.9618C134.505 20.9618 134.505 20.9618 134.487 20.9618L134.522 20.0105C134.176 20.0105 133.709 19.6473 133.709 19.1458C133.709 18.575 134.072 18.2637 134.522 18.1253V17.0185C133.657 17.1741 133.017 17.693 132.758 18.4021L131.616 18.4194C131.564 17.5546 131.98 16.7763 132.862 16.4823V15.3581C132.118 15.5138 131.634 15.877 131.34 16.2056C131.253 16.2921 131.184 16.3958 131.097 16.4996L130.233 16.5169C130.198 15.6867 130.613 14.943 131.392 14.6836V13.5594C130.907 13.6632 130.492 13.8534 130.129 14.1648H129.316C129.333 13.6286 129.645 13.1097 130.077 12.7811C130.458 12.5044 130.942 12.3488 131.426 12.2969C131.582 12.2796 131.737 12.2623 131.893 12.2623C132.101 12.2623 132.308 12.2796 132.498 12.3142C132.965 12.4006 133.398 12.5736 133.778 12.833ZM131.461 5.91495C132.118 4.79076 132.498 3.35526 132.516 1.86788H135.127C135.145 2.05813 135.162 2.23108 135.162 2.42132C135.162 5.27503 132.879 7.59258 130.06 7.59258H129.87C130.475 7.22938 131.011 6.67594 131.461 5.91495ZM119.544 5.91495C120.202 4.79076 120.582 3.35526 120.599 1.86788H124.145C124.162 3.35526 124.543 4.79076 125.2 5.91495C125.65 6.67594 126.186 7.24668 126.791 7.59258H124.422C123.816 6.96996 123.315 6.12249 122.986 5.11937H121.793C121.481 6.12249 120.98 6.96996 120.357 7.59258H117.936C118.558 7.22938 119.112 6.67594 119.544 5.91495ZM107.455 5.91495C108.112 4.79076 108.493 3.35526 108.51 1.86788H112.246C112.263 3.35526 112.644 4.79076 113.301 5.91495C113.75 6.67594 114.287 7.22938 114.892 7.59258H112.315C111.71 6.96996 111.208 6.12249 110.879 5.11937H109.686C109.375 6.12249 108.873 6.96996 108.251 7.59258H105.829C106.452 7.22938 107.005 6.67594 107.455 5.91495ZM95.6597 5.91495C96.3169 4.79076 96.6974 3.35526 96.7147 1.86788H100.139C100.156 3.35526 100.537 4.79076 101.194 5.91495C101.644 6.67594 102.18 7.24668 102.785 7.59258H100.364C99.7586 6.96996 99.2571 6.12249 98.9284 5.11937H97.7351C97.4238 6.12249 96.9222 6.96996 96.2996 7.59258H94.0339C94.6738 7.22938 95.2273 6.67594 95.6597 5.91495ZM85.6457 2.33485C85.6457 2.17919 85.6457 2.02354 85.663 1.85058H88.3438C88.3611 3.33797 88.7416 4.77347 89.3988 5.89766C89.8485 6.65864 90.3846 7.22938 90.99 7.57529H90.7305C87.9979 7.59258 85.6457 5.18855 85.6457 2.33485ZM81.616 16.9493C82.7056 16.1364 83.7087 15.2371 84.7464 14.355C85.3863 13.8188 86.0435 13.2827 86.7353 12.8157C87.1331 12.539 87.5828 12.3661 88.0671 12.2969C88.24 12.2623 88.4303 12.245 88.6205 12.245C88.7935 12.245 88.9664 12.2623 89.1567 12.2796C89.6236 12.3488 90.0906 12.4871 90.4538 12.7638C90.8862 13.0752 91.1975 13.594 91.2148 14.1475H90.4019C90.0387 13.8534 89.6063 13.6459 89.1394 13.5421V14.6663C89.935 14.9257 90.35 15.6694 90.2982 16.4996L89.4334 16.4823C89.3642 16.3785 89.2777 16.2921 89.1913 16.1883C88.8972 15.877 88.3957 15.5138 87.6693 15.3408V16.465C88.534 16.759 88.9491 17.5373 88.9145 18.4021L87.7731 18.3848C87.5136 17.6584 86.8737 17.1568 86.0089 17.0012V18.1081C86.4586 18.2464 86.8218 18.5577 86.8218 19.1285C86.8218 19.63 86.3721 19.9932 86.0089 19.9932L86.0435 20.9445C86.0435 20.9445 86.0435 20.9445 86.0262 20.9445C85.7841 20.9445 85.5766 20.8753 85.3517 20.7715C84.6426 20.391 84.3659 19.5608 84.3832 18.7999L83.3455 18.2983C83.3455 18.3329 83.3282 18.3675 83.3282 18.4194C83.2417 19.0593 83.3282 19.6819 83.5357 20.2181L81.5814 22.0859C81.2009 21.152 80.6993 20.2699 80.094 19.4571C79.8692 19.1804 79.6443 18.9036 79.4022 18.6615C80.2151 18.0043 81.2701 17.2087 81.616 16.9493ZM49.4815 67.7798C49.3259 66.7248 49.4988 62.9717 49.6199 60.8271C49.6718 59.9624 50.329 59.2533 51.1765 59.1322C52.145 58.9939 53.3902 58.8036 54.3069 58.6134C55.7597 58.3021 57.1606 57.6621 57.4892 56.6244C57.7659 55.7251 57.6103 55.6213 57.5238 54.7046C57.4546 53.9955 57.3681 53.2691 57.3162 52.56C57.3162 52.4563 57.299 52.3352 57.299 52.2314C57.2817 51.8164 57.2989 51.384 57.3508 50.9689C57.2644 51.0208 57.1779 51.0727 57.0914 51.1245C56.8147 51.2802 56.5207 51.384 56.2266 51.4705C55.898 51.5569 55.5694 51.5915 55.2235 51.5915C54.4971 51.5915 53.788 51.4013 53.1481 51.0035C51.9893 50.2944 51.3148 49.0664 51.3494 47.7174C51.4013 45.3134 52.7676 43.6184 54.082 41.9754C54.7047 41.1971 55.3619 40.3842 55.8462 39.5195C57.3854 36.7523 57.7486 33.7429 56.9185 30.5779C56.5553 29.1943 55.7251 27.949 54.843 26.6173C54.5144 26.1157 54.2031 25.6487 53.8918 25.1299C53.8918 25.1299 53.2 25.4412 52.7503 25.3374C52.6293 25.3028 52.5082 25.251 52.3698 25.1645C51.3148 24.5073 50.1906 21.8265 50.2425 18.6096C50.2771 16.0499 50.8824 13.9226 52.0758 12.1758C51.8164 12.9022 51.5915 13.6632 51.4532 14.4242C51.2975 15.2543 51.2456 16.1191 51.2975 16.9493C51.3494 17.7967 51.5224 18.6096 51.7991 19.3706C51.678 18.5577 51.678 17.7449 51.7818 16.9493C51.8856 16.1537 52.0931 15.3927 52.3871 14.6663C52.6465 14.0264 52.9579 13.4038 53.3211 12.8157C53.0789 14.3031 53.0789 15.8078 53.4767 17.6757C53.7188 18.8344 54.2204 19.9413 54.6528 20.9099C55.0506 21.7919 55.3446 22.501 55.4657 23.0891C55.604 23.729 55.5175 24.2132 55.0852 24.611C55.1543 24.7321 55.2408 24.8532 55.31 24.9742C55.5003 25.2683 55.7078 25.5796 55.9153 25.8909C56.8147 27.2572 57.7486 28.6581 58.1637 30.2493C59.0631 33.7083 58.648 37.1327 56.9703 40.1594C56.4342 41.1279 55.7424 41.9754 55.0852 42.8056C53.8572 44.3448 52.6811 45.7976 52.6293 47.7693C52.612 48.6686 53.0443 49.4469 53.8053 49.9139C54.6009 50.3982 55.5521 50.4327 56.365 50.035C56.3823 50.0177 56.4169 50.0177 56.4342 50.0004C57.0568 49.6718 57.6103 49.0491 57.9389 48.3227C57.9562 48.2881 57.9562 48.2535 57.9735 48.219C58.3713 47.0602 58.8555 45.9187 59.409 44.8291C61.0347 41.5776 63.0582 38.5337 64.3381 35.1092C65.445 32.169 64.9434 28.5889 64.9434 28.5889C63.8192 29.0386 62.1762 29.0905 62.1762 29.0905C62.2281 25.4239 54.3588 16.9147 59.1495 6.53758C59.4781 7.07373 59.9105 7.62717 60.5159 8.19791L60.9482 8.613V7.10832C58.4404 4.51404 59.5992 2.04083 60.5331 1.21066C61.2423 1.47009 62.0551 2.24837 62.6605 3.19961L63.7155 2.8537C63.456 2.42132 63.162 2.00624 62.8334 1.62575C62.9372 1.55657 63.041 1.50468 63.162 1.48739C63.2139 1.48739 63.2831 1.47009 63.3696 1.47009C64.9434 1.47009 70.8584 2.83641 71.4464 3.14772L71.9653 4.72158C73.5737 5.15396 75.0611 6.01872 76.1161 6.58946C75.9432 7.03914 75.4589 8.05955 74.4904 7.95578C74.4904 7.95578 75.4416 8.52652 75.2513 9.42587C74.94 10.0831 74.5422 10.7576 74.0407 11.3456L73.0722 10.3771C71.9307 9.3221 70.9275 8.94161 70.0974 8.94161C69.0078 8.94161 68.2468 9.63341 67.9355 10.429C67.4512 11.6397 67.5031 12.6082 67.6761 13.2308C67.8144 13.6978 68.1949 14.0783 69.0597 14.1475C69.2153 14.1647 69.3883 14.1648 69.5612 14.1648C71.3426 14.1648 73.6775 13.5248 73.6775 13.5248C74.0407 15.4619 74.2655 15.8424 71.4983 15.8424C70.8584 15.8424 70.0628 15.8251 69.077 15.7905L71.8442 17.053C72.1555 17.0357 72.4495 17.0185 72.7435 17.0185C74.7844 17.0185 76.4101 17.6238 77.69 18.6096C77.984 18.8344 78.2607 19.0766 78.5201 19.336C79.506 20.3391 80.2151 21.5844 80.7166 22.8988C80.855 23.2793 80.9761 23.6598 81.0798 24.0403C81.616 26.0465 81.6852 28.1393 81.4084 29.8169C81.2009 29.5575 80.9933 29.3153 80.7512 29.0732L80.6301 28.9521C79.8 28.1393 78.3991 26.7383 76.7214 25.8736C76.0988 25.3201 75.5108 24.7667 74.94 24.1614C73.7121 22.8642 72.6225 21.4287 71.8096 19.803C72.3112 21.5498 73.1586 23.2274 74.1618 24.7667C74.5595 25.372 74.9746 25.9601 75.407 26.5308C75.7875 26.6865 76.1334 26.8594 76.4793 27.067C77.9494 27.8971 79.1946 29.177 79.921 29.9034C80.3534 30.3184 80.6993 30.7854 81.0279 31.2697C81.2874 31.6502 81.5122 32.0307 81.7543 32.4285C81.9273 32.7225 82.1175 33.0338 82.2905 33.3278C83.0688 34.5904 84.1065 35.8356 84.6945 35.8356C84.9021 35.8356 85.0577 35.68 85.1269 35.334C85.4382 33.7602 86.424 33.0684 87.4963 33.0684C87.9979 33.0684 88.5168 33.224 88.9837 33.5008L87.9114 34.5039C88.5513 35.2649 87.8768 36.4236 87.185 36.8041C86.4413 37.2019 86.8391 37.8937 87.3753 37.8937C87.5482 37.8937 87.7212 37.8246 87.8941 37.6689C88.3438 37.2538 88.9318 37.0463 89.5026 37.0463C90.7132 37.0463 91.9066 37.9802 91.7509 39.9173L90.817 39.3984C90.5057 40.4188 89.7793 40.8512 89.1048 40.8512C88.7935 40.8512 88.4995 40.7647 88.2746 40.5918C87.7558 40.2113 87.2196 39.8135 86.8564 39.8135C86.7353 39.8135 86.6143 39.8654 86.5451 39.9692C86.2684 40.3497 86.5624 40.7301 87.5482 41.2144C89.295 42.0792 89.5718 44.6216 86.9948 45.1058L86.718 43.532C86.597 43.5666 86.4759 43.5838 86.3549 43.5838C85.6112 43.5838 85.0923 42.9266 85.0058 42.4424C84.8848 41.7333 84.9194 41.3009 84.8848 40.8512C84.8675 40.4534 84.608 40.2805 84.3486 40.2805C84.0373 40.2805 83.726 40.5053 83.6914 40.9031C83.6395 41.6468 83.6568 42.6153 82.3424 42.8402L81.9273 44.1719C80.682 43.7395 79.4368 42.304 81.7025 39.8827C81.737 38.6547 80.4399 37.9456 78.6239 36.9252C78.3126 36.7523 77.984 36.562 77.6554 36.3718C77.4824 36.268 77.3095 36.1642 77.1365 36.0604C76.7733 35.8356 75.3724 34.8152 74.1445 33.7602L73.0722 34.3309C73.297 34.5212 73.5391 34.7287 73.8158 34.9708C74.9227 35.8875 76.1161 36.7868 76.5658 37.0463C76.6523 37.0982 76.7387 37.15 76.8252 37.2019C75.6491 38.2915 74.3866 39.2428 73.2451 40.0037C72.7781 40.3151 72.3285 40.6091 71.9134 40.8685C71.4983 41.1279 71.1005 41.3528 70.7719 41.543C69.8552 42.0619 69.1289 42.7018 68.5754 43.4282C68.2122 43.8952 67.9355 44.3967 67.7279 44.8983C67.5204 45.3825 67.382 45.8841 67.3129 46.3857C67.2783 46.5586 67.261 46.7143 67.2437 46.8872C67.2091 47.3542 67.2264 47.8039 67.2783 48.2363C67.3475 48.7032 67.3993 49.1702 67.4685 49.6372C67.555 50.3463 67.6242 51.0381 67.6761 51.7472C67.7452 52.5773 67.7798 53.3902 67.7798 54.2031C67.7798 56.6936 67.3993 58.475 65.6698 60.1699C64.4246 61.3979 62.6777 61.6919 60.9828 61.813C60.1008 61.8649 57.6276 62.2281 55.9499 62.4875C54.9814 62.6258 54.255 63.4387 54.2031 64.4245C54.1339 65.7563 54.1512 67.5031 54.6182 68.0911L56.9012 67.7798C57.4373 66.9842 58.7172 66.3616 59.9624 66.3616C60.9309 66.3616 61.8822 66.7421 62.4183 67.7452C62.574 68.0392 62.7123 68.3851 62.7815 68.8002C62.7988 68.9213 62.8161 69.0424 62.8334 69.1807L62.107 68.8867L61.6919 68.7137C61.6746 68.8175 61.6573 68.904 61.64 68.9905C61.3979 69.9936 60.8791 70.3568 60.2564 70.3568C59.9624 70.3568 59.6511 70.2703 59.3225 70.1492C59.2879 70.1319 59.2533 70.1147 59.2014 70.0974C58.6134 69.8552 58.1983 69.665 57.887 69.665C57.6794 69.665 57.5238 69.7515 57.3854 69.9936C57.1952 70.3222 57.3854 70.5989 57.714 70.8238C57.8178 70.8929 57.9562 70.9621 58.0772 71.014C59.824 71.7404 60.3256 73.4353 58.7172 75.1994L57.5065 74.1271C57.3162 74.2482 57.126 74.3001 56.953 74.3001C56.365 74.3001 55.8289 73.7639 55.6905 73.3661C55.4657 72.7608 55.7078 72.069 55.7943 71.5674C55.8116 71.4291 55.8289 71.2907 55.8116 71.187C55.777 70.9102 55.5867 70.6854 55.3619 70.5643C55.2581 70.5124 55.1543 70.4779 55.0333 70.4779C54.9295 70.4779 54.8257 70.4951 54.722 70.547C54.6182 70.5989 54.5317 70.6681 54.4625 70.7546C54.3069 70.9448 54.2723 71.2043 54.2723 71.4637C54.2723 71.602 54.2723 71.7577 54.255 71.8961C54.2204 72.1382 54.1512 72.363 53.9437 72.5533C53.8399 72.6397 53.7361 72.7089 53.6324 72.7781C53.5632 72.8127 53.2346 72.9684 53.2173 73.0375L53.0616 74.7325C51.851 74.4385 50.5192 73.8504 50.8478 71.9652C50.8997 71.6539 51.0035 71.2907 51.1765 70.8929C51.2283 70.7546 51.2975 70.5989 51.384 70.4433C50.3463 69.9244 49.6545 68.9386 49.4815 67.7798ZM70.1147 12.0374C70.7373 12.0374 71.3772 12.1931 72.0517 12.4352C72.7781 11.9856 72.9338 11.4148 73.2105 11.3802C73.4181 11.3629 73.5045 11.951 73.4008 12.5044C73.4008 12.5044 72.3803 12.7293 71.7058 12.833C71.0313 12.9541 70.2703 13.0579 69.5958 13.0579C69.4402 13.0579 69.3018 13.0579 69.1807 13.0406C68.8521 13.006 68.7484 12.9368 68.7484 12.9195C68.7484 12.9195 68.7484 12.9195 68.7484 12.9022C68.7138 12.7984 68.6792 12.6428 68.6792 12.4352C69.1116 12.1585 69.5958 12.0374 70.1147 12.0374ZM68.7829 11.2938C68.8175 11.1381 68.8867 10.9651 68.9559 10.7922C69.0251 10.6019 69.3364 9.99661 70.1147 9.99661C70.5644 9.99661 71.308 10.1869 72.3285 11.1381L72.7435 11.5705C71.8269 11.2765 70.9275 11.0343 70.0974 11.0343C69.6477 11.0343 69.2153 11.1208 68.7829 11.2938ZM82.2213 60.2218L84.0719 59.5992L84.9885 59.2879L85.5074 59.1149C86.3376 57.9388 87.6866 57.1087 88.9664 57.1087C90.2117 57.1087 91.405 57.9043 91.9931 59.9624L90.6959 59.6857C90.6959 61.0174 90.2636 61.3633 89.589 61.3633C89.4507 61.3633 89.295 61.346 89.1394 61.3287C88.9491 61.2941 88.7589 61.2595 88.5513 61.2249C87.9114 61.1039 87.4444 60.9655 87.1158 60.9655C86.8045 60.9655 86.597 61.0866 86.4759 61.4152C86.303 61.9167 86.7872 62.2281 87.4099 62.3837C88.9318 62.7296 89.7966 63.8019 89.5199 65.2374C89.4507 65.566 89.3469 65.8946 89.1567 66.2578C89.0875 66.4135 89.001 66.5519 88.8972 66.7075C88.8972 66.7075 88.8799 66.7075 88.8799 66.7248L87.3753 65.8082C87.1504 66.033 86.891 66.1195 86.6316 66.1195C86.0608 66.1195 85.5074 65.7044 85.2998 65.3412C85.2825 65.3066 85.2653 65.272 85.248 65.2374C85.075 64.8915 85.0577 64.4937 85.0577 64.1305C85.0577 63.923 85.075 63.7154 85.075 63.5252C85.075 63.3004 85.075 63.1101 85.0231 62.9717C84.9366 62.695 84.7118 62.5048 84.4697 62.401C84.3832 62.3664 84.2794 62.3491 84.193 62.3491C84.0373 62.3491 83.8816 62.401 83.7433 62.5048C83.3801 62.7642 83.3801 63.162 83.432 63.5598C83.4839 63.9749 83.553 64.3554 83.3282 64.7013C83.3109 64.7359 83.2936 64.7532 83.2763 64.7877C83.1898 64.8915 83.0861 64.9953 82.9823 65.0818C82.9131 65.1336 82.6018 65.3585 82.6018 65.445L82.7575 67.2782C81.7889 67.2091 80.7166 67.0015 80.1978 66.1195C80.094 65.9465 80.0075 65.7217 79.9556 65.4968C79.7654 64.8223 79.6789 63.9922 79.5751 62.8334C79.1428 62.6604 78.7623 62.4356 78.4337 62.1416C78.0186 61.7784 77.69 61.3287 77.4997 60.758C76.9809 59.2014 76.5312 56.0883 77.223 52.8022C77.223 52.8022 70.253 51.9374 68.7484 51.1764C68.6446 50.0868 68.5235 49.0318 68.3852 48.0806C68.3679 47.9076 68.3506 47.7347 68.3506 47.5444C68.6792 47.7347 69.0597 47.8385 69.4402 47.8385C69.7861 47.8385 70.0974 47.752 70.4087 47.5963C71.014 47.285 71.4291 46.7143 71.5502 46.0398C71.6367 45.6074 71.5848 45.1577 71.4118 44.7599C71.4118 44.7599 71.4118 44.7426 71.4291 44.7426C71.8961 44.6561 72.4149 44.587 72.9857 44.5178C73.9369 44.414 74.8017 44.3621 75.5972 44.3621C83.0342 44.3621 83.6395 48.4438 83.6395 48.4438C84.7983 52.7849 81.322 54.7392 81.322 54.7392C81.322 54.7392 80.4572 58.7171 82.2213 60.2218ZM63.9057 65.8427C63.9057 65.9638 63.9749 66.8978 64.6321 67.9009C64.2689 67.8144 63.9403 67.7625 63.629 67.7279C63.041 66.1714 61.7265 65.2547 59.9797 65.2547C58.5961 65.2547 57.1779 65.8427 56.3477 66.7421L55.3446 66.8805C55.2754 66.4481 55.2235 65.7044 55.2927 64.4764C55.31 64.0095 55.6732 63.629 56.1229 63.5598C58.6653 63.1793 60.4294 62.9372 61.0693 62.9026C62.868 62.7815 64.9088 62.4529 66.4308 60.9482C67.382 60.0143 68.0393 58.9766 68.4025 57.8178C68.7138 56.832 68.8521 55.7251 68.8521 54.2031C68.8521 53.5978 68.8348 52.9924 68.8002 52.3871C69.0597 52.4736 69.371 52.56 69.7169 52.6465C70.4779 52.8368 71.5156 53.0443 72.7781 53.2519C73.9369 53.4421 75.0957 53.6151 75.9086 53.7188C75.4935 56.7455 75.8913 59.5127 76.4274 61.0866C76.7733 62.1243 77.4824 62.9545 78.5028 63.5252C78.5028 64.6321 78.8487 65.739 78.8487 65.7736C78.0705 65.3758 76.8771 64.9261 75.4935 64.9261C74.9227 64.9261 74.352 65.0126 73.8158 65.1509C73.4699 65.2547 73.1413 65.3585 72.8127 65.445C71.6021 65.8082 70.4779 66.1714 69.2845 66.1714C68.022 66.1714 66.8286 65.7736 65.5488 64.8915L63.7673 63.6809L63.9057 65.8427ZM70.2703 45.0021C70.6508 45.5901 70.4433 46.3511 69.8725 46.6451C69.7169 46.7316 69.5612 46.7662 69.4056 46.7662C69.0251 46.7662 68.6619 46.5586 68.4543 46.23C68.4889 46.0398 68.5581 45.8322 68.61 45.642C68.7829 45.1231 69.0424 44.6216 69.4056 44.1373C69.8725 43.5147 70.4952 42.9439 71.3253 42.477C71.4464 42.4078 71.5848 42.3213 71.7404 42.2348C71.187 42.9093 70.8584 43.3936 70.6508 43.8087C70.426 44.2238 70.3222 44.5524 70.1666 44.8637C70.1839 44.8983 70.2357 44.9502 70.2703 45.0021ZM77.2403 38.2742C77.4305 38.1013 77.6208 37.9283 77.811 37.7554C77.9494 37.8246 78.0705 37.911 78.2088 37.9802C79.2292 38.551 80.1978 39.1044 80.5091 39.5714C79.7654 40.488 79.1082 41.7333 79.4368 43.0304C79.506 43.3071 79.627 43.5838 79.7827 43.826C78.6585 43.4974 77.2749 43.2898 75.5627 43.2898L72.0863 43.532C72.3803 43.1169 72.7954 42.6153 73.4354 41.9581L75.8221 39.4676L75.8394 39.4503C76.2891 39.0871 76.7733 38.6893 77.2403 38.2742ZM61.813 75.2686C60.0316 77.1711 57.6276 78.0531 55.1543 78.0531C50.917 78.0531 46.5413 75.4416 45.0021 70.8411C45.0021 70.8411 47.0948 71.5502 49.7928 71.8615C49.6718 72.6052 49.741 73.2624 50.0177 73.8504C50.6057 75.0957 51.9029 75.5453 52.8195 75.7875L54.0475 76.0988L54.1685 74.8362L54.2896 73.6602C54.3934 73.591 54.5144 73.5045 54.6182 73.418C54.6355 73.5218 54.6701 73.6256 54.7047 73.7293C54.9987 74.5422 55.9326 75.3724 56.9876 75.3724C57.0914 75.3724 57.1952 75.3724 57.299 75.3551L58.0426 76.0123L58.8382 76.7214L59.5646 75.9258C60.585 74.8189 61.0001 73.5737 60.7407 72.4322C60.6542 72.069 60.5159 71.7231 60.3083 71.4118C60.9482 71.4118 61.519 71.1697 61.9514 70.72C62.107 70.547 62.2627 70.3568 62.3664 70.132L62.4356 70.1492L64.1133 70.8411L63.923 69.0424C63.923 68.9732 63.9057 68.9213 63.9057 68.8521C64.6494 68.9732 65.5488 69.2499 66.6902 69.6823C66.8459 69.7688 67.0188 69.8379 67.1745 69.8898C67.261 69.9244 67.3302 69.959 67.4166 69.9763C67.0534 70.1838 66.6902 70.3914 66.3616 70.5989C64.7186 71.6539 63.5944 72.7954 63.0064 73.9888C62.6432 74.4039 62.2454 74.8189 61.813 75.2686ZM74.6287 71.5156C73.4354 72.5187 71.775 72.7262 70.2703 72.83C65.7044 73.1759 63.8365 77.2922 63.8365 77.2922C63.456 76.3409 63.5252 75.4416 63.8884 74.6287C64.4419 73.3834 65.6871 72.3111 67.0015 71.481C69.198 70.0974 71.6194 69.3191 71.6194 69.3191C71.187 69.3537 70.7892 69.371 70.4087 69.371C69.4575 69.371 68.6792 69.2499 68.0393 69.0596C67.6761 68.9559 67.3474 68.8175 67.0707 68.6792C65.0472 67.6414 64.978 65.7909 64.978 65.7909C66.5865 66.8805 68.0047 67.261 69.3191 67.261C71.014 67.261 72.5533 66.6556 74.1272 66.2059C74.5941 66.0676 75.0611 66.0157 75.5108 66.0157C76.8079 66.0157 77.9321 66.5 78.572 66.8459C77.7591 67.3474 77.0673 67.9873 76.5312 68.8002C76.3236 69.1288 76.1334 69.4574 75.9777 69.7687C75.4762 70.4779 75.1476 71.1005 74.6287 71.5156ZM82.2213 69.9417C80.6301 70.3049 79.1428 71.2215 78.6412 72.8646C78.3472 73.8158 78.3991 74.8535 78.451 75.8394C78.451 75.8394 75.1995 73.9888 76.929 70.3395C77.0673 70.0455 77.2576 69.7169 77.4651 69.3883C77.8802 68.7483 78.3818 68.2987 78.8487 67.9528C79.0217 67.849 79.1946 67.7625 79.3849 67.6587L79.8692 67.4166C80.6993 68.1257 81.8235 68.2987 82.6537 68.3505L83.9162 68.437L83.8125 67.1745L83.7087 65.86C83.8471 65.739 83.9854 65.6006 84.1238 65.4277C84.1238 65.4104 84.1411 65.4104 84.1411 65.3931C84.193 65.5487 84.2621 65.7044 84.3486 65.8427C84.7291 66.5 85.6285 67.1572 86.6143 67.1572C86.8737 67.1572 87.1158 67.1053 87.358 67.0188L87.9287 67.3647C87.8941 67.3993 87.8422 67.4339 87.8076 67.4685C85.9571 69.2153 84.5907 69.4056 82.2213 69.9417ZM131.288 75.9604C131.288 75.9604 132.222 71.8269 130.233 70.5124C127.05 68.437 125.355 70.2184 121.793 67.5031C121.758 67.4512 121.706 67.4166 121.672 67.3647C119.994 65.6698 118.143 64.5975 116.466 64.0268C115.307 64.217 114.027 64.3554 112.609 64.4245C112.886 64.4418 113.162 64.4591 113.456 64.4937C113.958 64.5456 114.494 64.6321 115.048 64.7532C115.895 64.9434 116.794 65.2374 117.694 65.6698C118.783 66.2059 119.873 67.0707 120.893 68.1084C120.963 68.1776 121.014 68.2295 121.066 68.2987C123.28 70.7027 122.692 73.0548 122.692 73.0548C122.692 73.0548 119.856 69.2845 115.618 69.2845C113.595 69.2845 111.848 69.959 110.949 70.4087L110.291 70.7546L109.634 70.4087C108.735 69.9763 106.988 69.2845 104.964 69.2845C100.727 69.2845 97.8907 73.0548 97.8907 73.0548C97.8907 73.0548 97.2854 70.7027 99.5165 68.2987C99.5684 68.2295 99.6376 68.1776 99.6894 68.1084C100.71 67.0707 101.799 66.1886 102.889 65.6698C103.788 65.2374 104.688 64.9434 105.535 64.7532C106.089 64.6321 106.625 64.5456 107.126 64.4937C107.42 64.4591 107.714 64.4418 107.991 64.4245C106.573 64.3554 105.293 64.217 104.117 64.0268C102.439 64.5975 100.589 65.6525 98.9111 67.3647C98.8593 67.4166 98.8247 67.4512 98.7901 67.5031C95.2273 70.2184 93.5324 68.437 90.35 70.5124C88.3611 71.8096 89.295 75.9604 89.295 75.9604C89.295 75.9604 85.0923 72.7781 88.8972 68.5754C89.6928 67.6933 90.6614 66.9669 91.3705 66.4827C91.9585 66.0849 92.3736 65.86 92.3736 65.86C92.3736 65.86 92.0277 65.8255 91.578 65.739C91.3359 65.7044 91.0418 65.6352 90.7305 65.566C90.6786 65.5487 90.6095 65.5314 90.5403 65.5141C90.6959 64.7704 90.6441 64.044 90.3846 63.4041C90.2809 63.1447 90.1252 62.8853 89.9522 62.6604C91.5953 63.1101 93.6188 63.456 95.9191 63.456C96.8011 63.456 97.7178 63.2658 98.6863 63.162C99.0149 63.1274 99.3781 63.1101 99.7413 63.1101C99.8624 63.1101 99.9835 63.1101 100.105 63.1274C99.2052 62.8507 98.4096 62.5394 97.6832 62.2281C97.0952 62.3145 96.5071 62.401 95.9191 62.401C94.1031 62.401 92.4773 62.1762 91.0764 61.8476C91.3359 61.5881 91.4915 61.2941 91.5953 60.9655L91.7509 61.0001L93.5151 61.3806L93.0135 59.6338C92.0796 56.3477 89.8658 56.0018 88.9491 56.0018C87.479 56.0018 85.8879 56.8493 84.8329 58.181L82.5845 58.942C82.0829 58.0253 82.1175 56.3996 82.2559 55.3792C82.6537 55.0851 83.2244 54.5836 83.7433 53.8399C84.5389 52.7157 85.3344 50.8305 84.6426 48.2017C84.5734 47.8558 84.2102 46.524 82.792 45.348L83.0515 44.5005L83.2763 43.7568C83.6222 43.6184 83.8989 43.4109 84.1065 43.1861C84.4178 43.826 85.0231 44.414 85.7841 44.6043L85.9052 45.2615L86.0954 46.403L87.2196 46.1954C88.7762 45.9014 89.8139 44.9329 90.0041 43.6184C90.0906 43.0304 89.9868 42.4251 89.7274 41.8716C90.3154 41.7333 90.8516 41.4047 91.2494 40.9031L92.7195 41.7333L92.8578 39.9692C92.9789 38.4299 92.4255 37.4614 91.9412 36.9425C91.3186 36.268 90.4192 35.8875 89.4853 35.8875C89.3815 35.8875 89.295 35.8875 89.1913 35.9048C89.2086 35.8183 89.2431 35.7318 89.2604 35.6454C89.3123 35.3513 89.3123 35.0573 89.2604 34.7633L89.762 34.2963L90.8689 33.2586L89.5718 32.4803C88.9145 32.0826 88.2054 31.875 87.4963 31.875C86.3203 31.875 84.9712 32.4803 84.2967 34.1061C84.02 33.7775 83.6568 33.3105 83.259 32.6706C83.1034 32.4112 82.9477 32.1517 82.792 31.8923C82.6191 31.5983 82.4288 31.287 82.2386 30.993V30.9757C82.8093 28.8311 82.792 25.8909 81.9446 23.1582L84.0719 21.1347C84.2794 21.3768 84.5389 21.5671 84.8156 21.7054C85.2134 21.913 85.5766 22.0168 85.9917 22.0168H86.0089L87.1331 21.9995V20.6159C87.1677 20.5813 87.2196 20.5467 87.2542 20.5121C87.5655 20.2181 87.7558 19.8549 87.8249 19.4398L88.8627 19.4571L89.9004 19.4744L89.9522 18.4367C89.9695 18.1253 89.935 17.8313 89.8831 17.5373H90.2636L91.3013 17.5546L91.3532 16.5169C91.3705 16.0499 91.3013 15.6003 91.1456 15.2025H91.1802H92.2871L92.2525 14.0956C92.2352 13.2308 91.7855 12.4006 91.0591 11.8818C90.4192 11.4148 89.6928 11.2419 89.1221 11.19V8.66488H131.392V11.1727C130.821 11.2246 130.06 11.3975 129.403 11.8818C128.676 12.4179 128.226 13.2481 128.209 14.0956L128.175 15.2025H129.281H129.316C129.16 15.6003 129.074 16.0499 129.109 16.5169L129.16 17.5546L130.198 17.5373H130.579C130.509 17.814 130.492 18.1253 130.509 18.4367L130.561 19.4744L131.599 19.4571L132.637 19.4398C132.706 19.8376 132.896 20.2181 133.207 20.5121C133.242 20.5467 133.294 20.5813 133.329 20.6159V21.9995L134.453 22.0168H134.47C134.885 22.0168 135.248 21.913 135.646 21.7054C135.923 21.5498 136.182 21.3595 136.39 21.1347L138.517 23.1582C137.67 25.8909 137.635 28.8311 138.223 30.9757V30.993C138.033 31.287 137.843 31.5983 137.67 31.8923C137.514 32.1517 137.358 32.4112 137.203 32.6706C136.822 33.2932 136.442 33.7948 136.165 34.1234C135.49 32.4976 134.141 31.8923 132.965 31.8923C132.256 31.8923 131.547 32.0998 130.89 32.4976L129.593 33.2759L130.7 34.3136L131.201 34.7806C131.149 35.0573 131.149 35.3513 131.201 35.6627C131.219 35.7491 131.236 35.8356 131.27 35.9221C131.167 35.9221 131.08 35.9048 130.976 35.9048C130.025 35.9048 129.126 36.2853 128.52 36.9598C128.036 37.4959 127.483 38.4472 127.604 39.9865L127.742 41.7506L129.212 40.9204C129.61 41.4047 130.146 41.7333 130.734 41.8889C130.475 42.4424 130.371 43.0304 130.458 43.6357C130.648 44.9675 131.686 45.936 133.242 46.2127L134.366 46.4203L134.557 45.2788L134.678 44.6216C135.456 44.414 136.061 43.8433 136.355 43.2034C136.563 43.4282 136.839 43.6184 137.185 43.7741L137.376 44.3967L137.41 44.5178L137.67 45.3653C136.251 46.5586 135.888 47.8731 135.819 48.219C135.127 50.8478 135.923 52.733 136.718 53.8572C137.237 54.6009 137.808 55.1024 138.206 55.3965C138.344 56.4169 138.379 58.0426 137.877 58.9593L135.629 58.1983C134.557 56.8665 132.983 56.0191 131.513 56.0191C130.596 56.0191 128.382 56.365 127.448 59.6511L126.947 61.3979L128.711 61.0174L128.866 60.9828C128.97 61.2941 129.126 61.6054 129.385 61.8649C127.984 62.1762 126.359 62.4183 124.543 62.4183C123.955 62.4183 123.367 62.3318 122.778 62.2453C122.052 62.5567 121.257 62.868 120.357 63.1447C120.478 63.1447 120.582 63.1447 120.703 63.1447C121.066 63.1447 121.429 63.162 121.758 63.1966C122.727 63.3176 123.643 63.4906 124.525 63.4906C126.826 63.4906 128.849 63.1447 130.492 62.695C130.319 62.9199 130.164 63.162 130.06 63.4387C129.8 64.0786 129.748 64.805 129.904 65.5487C129.835 65.566 129.783 65.5833 129.714 65.6006C129.403 65.6698 129.109 65.739 128.866 65.7736C128.399 65.86 128.123 65.8773 128.123 65.8773C128.123 65.8773 128.538 66.1022 129.126 66.5C129.835 66.9842 130.786 67.7106 131.599 68.5927C135.49 72.7781 131.288 75.9604 131.288 75.9604ZM142.08 75.8394C142.132 74.8535 142.166 73.8158 141.89 72.8646C141.388 71.2215 139.901 70.3222 138.31 69.9417C135.94 69.3883 134.574 69.2153 132.723 67.5031C132.689 67.4685 132.637 67.4339 132.602 67.3993L133.173 67.0534C133.398 67.1399 133.657 67.1918 133.917 67.1918C134.92 67.1918 135.819 66.5346 136.182 65.8773C136.269 65.7217 136.338 65.5833 136.39 65.4277C136.39 65.445 136.407 65.445 136.407 65.4623C136.545 65.6352 136.684 65.7736 136.822 65.8946L136.718 67.2091L136.615 68.4716L137.877 68.3851C138.707 68.3333 139.814 68.1603 140.662 67.4512L141.146 67.6933C141.336 67.7971 141.509 67.8836 141.682 67.9873C142.166 68.3333 142.651 68.7829 143.066 69.4229C143.291 69.7515 143.464 70.0628 143.602 70.3741C145.331 73.9888 142.08 75.8394 142.08 75.8394ZM156.66 77.3094C156.66 77.3094 154.809 73.1932 150.226 72.8473C148.721 72.7262 147.078 72.5187 145.868 71.5329C145.349 71.1005 145.02 70.4779 144.501 69.786C144.346 69.4574 144.155 69.1461 143.948 68.8175C143.412 68.0046 142.737 67.3474 141.907 66.8632C142.547 66.5173 143.654 66.033 144.968 66.033C145.418 66.033 145.868 66.0849 146.352 66.2232C147.943 66.6729 149.465 67.2782 151.16 67.2782C152.474 67.2782 153.893 66.915 155.501 65.8082C155.501 65.8082 155.415 67.6587 153.408 68.6964C153.132 68.8348 152.803 68.9732 152.44 69.0769C151.8 69.2672 151.004 69.3883 150.07 69.3883C149.69 69.3883 149.292 69.371 148.86 69.3364C148.86 69.3364 151.281 70.1147 153.477 71.4983C154.809 72.3457 156.037 73.4007 156.591 74.646C156.971 75.4589 157.058 76.3409 156.66 77.3094ZM165.377 78.0531C162.903 78.0531 160.482 77.1711 158.718 75.2686C158.285 74.8189 157.905 74.3866 157.525 74.0061C156.936 72.7954 155.812 71.6712 154.169 70.6162C153.841 70.4087 153.495 70.2011 153.114 69.9936C153.201 69.959 153.27 69.9244 153.356 69.9071C153.529 69.8379 153.685 69.7688 153.841 69.6996C154.982 69.2499 155.881 68.9905 156.625 68.8694C156.625 68.9386 156.608 68.9905 156.608 69.0596L156.418 70.8583L158.095 70.1665L158.164 70.1492C158.286 70.3741 158.424 70.5643 158.58 70.7373C159.012 71.187 159.583 71.4291 160.223 71.4291C160.015 71.7404 159.877 72.0863 159.79 72.4495C159.531 73.591 159.963 74.8362 160.966 75.9431L161.693 76.7387L162.488 76.0296L163.232 75.3724C163.336 75.3897 163.439 75.3897 163.543 75.3897C164.598 75.3897 165.532 74.5595 165.826 73.7466C165.861 73.6429 165.895 73.5391 165.913 73.4353C166.034 73.5218 166.138 73.6083 166.241 73.6775L166.362 74.8535L166.483 76.1161L167.711 75.8048C168.628 75.5799 169.925 75.113 170.513 73.8677C170.79 73.2797 170.859 72.6225 170.738 71.8788C173.419 71.5674 175.529 70.8583 175.529 70.8583C173.972 75.4589 169.597 78.0531 165.377 78.0531ZM71.2216 4.98101C69.6477 5.41339 67.6588 4.99831 67.6588 4.99831C68.8694 6.19167 69.2672 6.91807 69.2672 6.91807C70.8584 7.00455 71.2216 5.96684 71.2216 4.98101ZM149.309 4.98101C149.309 5.96684 149.673 7.00455 151.264 6.93537C151.264 6.93537 151.679 6.20897 152.872 5.0156C152.872 5.0156 150.883 5.41339 149.309 4.98101ZM150.261 26.2887C150.537 25.8217 150.814 25.3547 151.091 24.8878C151.54 24.1268 151.955 23.3139 152.319 22.4837C152.665 21.6536 152.959 20.8234 153.218 19.9759C153.495 19.1458 153.737 18.2983 153.979 17.4508C153.599 18.2464 153.218 19.0247 152.803 19.803C152.405 20.5813 151.99 21.3423 151.54 22.0686C151.073 22.795 150.572 23.4696 150.018 24.1268C149.534 24.7148 149.015 25.3201 148.514 25.9082C149.084 25.9774 149.673 26.0811 150.261 26.2887ZM68.2122 22.4837C68.5581 23.3139 68.9905 24.1268 69.4402 24.8878C69.7169 25.3547 69.9936 25.8217 70.2703 26.2887C70.8584 26.0811 71.4464 25.9601 72.0171 25.9255C71.5156 25.3374 70.9967 24.7321 70.5125 24.1441C69.959 23.4696 69.4575 22.795 68.9905 22.0859C68.5408 21.3595 68.1257 20.5986 67.7279 19.8203C67.3302 19.042 66.9497 18.2464 66.5519 17.4681C66.794 18.3156 67.0534 19.1458 67.3129 19.9932C67.5723 20.8234 67.8663 21.6536 68.2122 22.4837ZM67.9528 27.4993C66.6211 25.5796 65.3412 23.6252 64.2689 21.5671C63.6809 20.4429 63.162 19.2841 62.7469 18.0908C62.3145 16.8974 61.9686 15.6694 61.6919 14.4242C61.8303 15.704 62.0205 16.9666 62.3145 18.2291C62.6086 19.4917 63.0064 20.7196 63.4733 21.9303C63.9403 23.1409 64.4764 24.317 65.0299 25.4758C65.4796 26.3924 65.9465 27.2918 66.4135 28.1911C66.8632 28.0528 67.382 27.8279 67.9528 27.4993ZM154.083 28.1911C154.567 27.2918 155.034 26.3924 155.466 25.4758C156.037 24.317 156.573 23.1409 157.023 21.9303C157.49 20.7196 157.87 19.4744 158.182 18.2291C158.476 16.9666 158.683 15.704 158.804 14.4242C158.528 15.6694 158.182 16.8974 157.749 18.0908C157.317 19.2841 156.798 20.4429 156.227 21.5671C155.155 23.6252 153.875 25.5796 152.544 27.4993C153.149 27.8279 153.65 28.0528 154.083 28.1911Z",
          fill: "#CC0000"
        }), jsxRuntimeExports.jsx("path", {
          d: "M128.469 14.1474H128.244H92.2871H92.1314L91.6298 15.2025H128.745L128.469 14.1474ZM133.38 20.5467V33.0511C133.761 33.1203 134.124 33.2759 134.435 33.5353V20.7542L133.38 20.5467ZM133.761 43.5147L133.484 45.0885C133.45 45.0885 133.415 45.0712 133.38 45.0712V47.2504C133.38 50.1733 132.516 52.8368 130.838 55.137C130.423 55.6905 129.973 56.2266 129.472 56.7455L88.3265 15.5657C88.1362 15.4792 87.9114 15.3927 87.652 15.3408V16.465C88.5167 16.759 88.9318 17.5373 88.8972 18.4021L87.7557 18.3848C87.5136 17.693 86.9083 17.2087 86.0954 17.0184V18.1426C86.4932 18.2983 86.7872 18.6096 86.7872 19.1285C86.7872 19.5781 86.424 19.924 86.0954 19.9932V33.4489C86.5105 33.103 87.012 32.9819 87.5309 32.9819C88.0324 32.9819 88.534 33.1721 89.001 33.4489L87.9287 34.452C88.5686 35.213 87.8941 36.3717 87.2023 36.7522C86.4586 37.15 86.8564 37.8418 87.3925 37.8418C87.5655 37.8418 87.7384 37.7727 87.9114 37.617C88.3611 37.2019 88.9491 36.9944 89.5198 36.9944C90.7305 36.9944 91.9239 37.9283 91.7682 39.8654L90.8343 39.3465C90.523 40.3669 89.7965 40.7993 89.122 40.7993C88.8107 40.7993 88.5167 40.7128 88.2919 40.5399C87.773 40.1594 87.2369 39.7616 86.8737 39.7616C86.7526 39.7616 86.6315 39.8135 86.5624 39.9173C86.2856 40.2978 86.5797 40.6782 87.5655 41.1625C89.2258 41.9927 89.5544 44.3794 87.3752 45.0193L87.012 45.0539L86.7353 43.4801C86.6142 43.5147 86.4932 43.532 86.3721 43.532C86.2683 43.532 86.1646 43.5147 86.0608 43.4974V47.2158C86.0608 50.8997 87.3233 53.9782 89.3815 56.4515C89.3988 56.4687 89.4161 56.486 89.4161 56.5033C89.4852 56.5898 89.5717 56.6763 89.6409 56.7628C89.6582 56.7801 89.6755 56.7974 89.6928 56.8146C89.7793 56.9184 89.8657 57.0049 89.9522 57.1087C89.9522 57.1087 89.9522 57.126 89.9695 57.126C90.056 57.2297 90.1598 57.3162 90.2462 57.42L90.2635 57.4373C90.3846 57.5065 90.4884 57.5929 90.5921 57.6794C90.7997 57.8524 91.0072 58.0599 91.1802 58.302C92.5119 59.4781 94.0685 60.4639 95.7461 61.2941C95.9363 61.3979 96.1266 61.5016 96.3341 61.5881C99.1014 62.9717 103.148 64.4764 110.222 64.4764C117.296 64.4764 121.343 62.9717 124.11 61.5881C124.318 61.4843 124.508 61.3806 124.698 61.2941C126.359 60.4812 127.881 59.4954 129.212 58.3539C129.247 58.302 129.281 58.2501 129.316 58.1983C129.333 58.181 129.351 58.1637 129.368 58.1291C129.385 58.1118 129.403 58.0772 129.437 58.0599C129.454 58.0253 129.489 58.008 129.506 57.9734C129.524 57.9561 129.524 57.9388 129.541 57.9388C129.575 57.9042 129.61 57.8697 129.645 57.8351L129.662 57.8178C129.697 57.7832 129.731 57.7486 129.766 57.714C129.766 57.714 129.766 57.714 129.783 57.6967C129.818 57.6621 129.869 57.6275 129.904 57.5929C129.991 57.5238 130.077 57.4719 130.163 57.42C130.181 57.4027 130.198 57.4027 130.215 57.3854C132.792 54.7565 134.401 51.3494 134.401 47.1812V43.5147C134.297 43.5492 134.193 43.5665 134.072 43.5665C134.003 43.5665 133.882 43.5492 133.761 43.5147Z",
          fill: "#CC0000"
        }), jsxRuntimeExports.jsx("path", {
          d: "M11.9378 1H0V99.487H11.9378V1Z",
          fill: "#FFCC00"
        })]
      }), jsxRuntimeExports.jsx("defs", {
        children: jsxRuntimeExports.jsx("clipPath", {
          id: "clip0_908_6292",
          children: jsxRuntimeExports.jsx("rect", {
            width: "192",
            height: "100",
            fill: "white"
          })
        })
      })]
    }));
  });
  LogoImage.displayName = "LogoImage";
  var _excluded$z = ["children", "className"];
  function ownKeys$z(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread$z(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys$z(Object(t), true).forEach(function(r3) {
        _defineProperty(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$z(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  var Mark = /* @__PURE__ */ reactExports.forwardRef(function(_ref, ref) {
    var children = _ref.children, className = _ref.className, restProps = _objectWithoutProperties(_ref, _excluded$z);
    return jsxRuntimeExports.jsx("mark", _objectSpread$z(_objectSpread$z({
      ref,
      className: clsx("utrecht-mark", className)
    }, restProps), {}, {
      children
    }));
  });
  Mark.displayName = "Mark";
  var _excluded$y = ["children", "className"];
  function ownKeys$y(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread$y(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys$y(Object(t), true).forEach(function(r3) {
        _defineProperty(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$y(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  var MultilineData = /* @__PURE__ */ reactExports.forwardRef(function(_ref, ref) {
    var children = _ref.children, className = _ref.className, restProps = _objectWithoutProperties(_ref, _excluded$y);
    return jsxRuntimeExports.jsx("pre", _objectSpread$y(_objectSpread$y({
      ref,
      className: clsx("utrecht-multiline-data", "utrecht-multiline-data--html-pre", className)
    }, restProps), {}, {
      children
    }));
  });
  MultilineData.displayName = "MultilineData";
  var _excluded$w = ["children", "className", "value"];
  function ownKeys$w(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread$w(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys$w(Object(t), true).forEach(function(r3) {
        _defineProperty(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$w(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  var NumberData = /* @__PURE__ */ reactExports.forwardRef(function(_ref, ref) {
    var children = _ref.children, className = _ref.className, value = _ref.value, restProps = _objectWithoutProperties(_ref, _excluded$w);
    return jsxRuntimeExports.jsx("data", _objectSpread$w(_objectSpread$w({
      value: typeof value === "string" || typeof value === "number" ? String(value) : void 0
    }, restProps), {}, {
      ref,
      className: clsx("utrecht-number-data", className),
      children
    }));
  });
  NumberData.displayName = "NumberData";
  var _excluded$v = ["children", "className"];
  function ownKeys$v(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread$v(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys$v(Object(t), true).forEach(function(r3) {
        _defineProperty(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$v(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  var OrderedList = /* @__PURE__ */ reactExports.forwardRef(function(_ref, ref) {
    var children = _ref.children, className = _ref.className, restProps = _objectWithoutProperties(_ref, _excluded$v);
    return jsxRuntimeExports.jsx("ol", _objectSpread$v(_objectSpread$v({}, restProps), {}, {
      ref,
      className: clsx("utrecht-ordered-list", className),
      children
    }));
  });
  OrderedList.displayName = "OrderedList";
  var _excluded$u = ["children", "className"];
  function ownKeys$u(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread$u(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys$u(Object(t), true).forEach(function(r3) {
        _defineProperty(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$u(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  var OrderedListItem = /* @__PURE__ */ reactExports.forwardRef(function(_ref, ref) {
    var children = _ref.children, className = _ref.className, restProps = _objectWithoutProperties(_ref, _excluded$u);
    return jsxRuntimeExports.jsx("li", _objectSpread$u(_objectSpread$u({}, restProps), {}, {
      ref,
      className: clsx("utrecht-ordered-list__item", className),
      children
    }));
  });
  OrderedListItem.displayName = "OrderedListItem";
  var _excluded$t = ["children", "className"];
  function ownKeys$t(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread$t(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys$t(Object(t), true).forEach(function(r3) {
        _defineProperty(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$t(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  var Page = /* @__PURE__ */ reactExports.forwardRef(function(_ref, ref) {
    var children = _ref.children, className = _ref.className, restProps = _objectWithoutProperties(_ref, _excluded$t);
    return jsxRuntimeExports.jsx("div", _objectSpread$t(_objectSpread$t({}, restProps), {}, {
      ref,
      className: clsx("utrecht-page", className),
      children
    }));
  });
  Page.displayName = "Page";
  var _excluded$s = ["children", "className"], _excluded2$1 = ["children", "className"];
  function ownKeys$s(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread$s(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys$s(Object(t), true).forEach(function(r3) {
        _defineProperty(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$s(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  var PageContent = /* @__PURE__ */ reactExports.forwardRef(function(_ref, ref) {
    var children = _ref.children, className = _ref.className, restProps = _objectWithoutProperties(_ref, _excluded$s);
    return jsxRuntimeExports.jsx("div", _objectSpread$s(_objectSpread$s({}, restProps), {}, {
      ref,
      className: clsx("utrecht-page-content", className),
      children
    }));
  });
  PageContent.displayName = "PageContent";
  var PageContentMain = /* @__PURE__ */ reactExports.forwardRef(function(_ref2, ref) {
    var children = _ref2.children, className = _ref2.className, restProps = _objectWithoutProperties(_ref2, _excluded2$1);
    return jsxRuntimeExports.jsx("main", _objectSpread$s(_objectSpread$s({}, restProps), {}, {
      ref,
      className: clsx("utrecht-page-content__main", className),
      children
    }));
  });
  PageContentMain.displayName = "PageContentMain";
  var _excluded$r = ["children", "className"];
  function ownKeys$r(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread$r(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys$r(Object(t), true).forEach(function(r3) {
        _defineProperty(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$r(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  var PageFooter = /* @__PURE__ */ reactExports.forwardRef(function(_ref, ref) {
    var children = _ref.children, className = _ref.className, restProps = _objectWithoutProperties(_ref, _excluded$r);
    return jsxRuntimeExports.jsx("footer", _objectSpread$r(_objectSpread$r({}, restProps), {}, {
      ref,
      className: clsx("utrecht-page-footer", className),
      children
    }));
  });
  PageFooter.displayName = "PageFooter";
  var _excluded$q = ["children", "className"];
  function ownKeys$q(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread$q(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys$q(Object(t), true).forEach(function(r3) {
        _defineProperty(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$q(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  var PageHeader = /* @__PURE__ */ reactExports.forwardRef(function(_ref, ref) {
    var children = _ref.children, className = _ref.className, restProps = _objectWithoutProperties(_ref, _excluded$q);
    return jsxRuntimeExports.jsx("header", _objectSpread$q(_objectSpread$q({}, restProps), {}, {
      ref,
      className: clsx("utrecht-page-header", className),
      children
    }));
  });
  PageHeader.displayName = "PageHeader";
  var _excluded$p = ["children", "className", "lead", "small"];
  function ownKeys$p(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread$p(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys$p(Object(t), true).forEach(function(r3) {
        _defineProperty(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$p(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  var Paragraph = /* @__PURE__ */ reactExports.forwardRef(function(_ref, ref) {
    var children = _ref.children, className = _ref.className, lead = _ref.lead, small = _ref.small, restProps = _objectWithoutProperties(_ref, _excluded$p);
    return jsxRuntimeExports.jsx("p", _objectSpread$p(_objectSpread$p({}, restProps), {}, {
      ref,
      className: clsx("utrecht-paragraph", lead && "utrecht-paragraph--lead", small && "utrecht-paragraph--small", className),
      children: lead ? jsxRuntimeExports.jsx("b", {
        className: "utrecht-paragraph__b",
        children
      }) : small ? jsxRuntimeExports.jsx("small", {
        className: "utrecht-paragraph__small",
        children
      }) : children
    }));
  });
  Paragraph.displayName = "Paragraph";
  var _excluded$o = ["loading", "className"];
  function ownKeys$o(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread$o(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys$o(Object(t), true).forEach(function(r3) {
        _defineProperty(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$o(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  var DataPlaceholder = /* @__PURE__ */ reactExports.forwardRef(function(_ref, ref) {
    var loading = _ref.loading, className = _ref.className, restProps = _objectWithoutProperties(_ref, _excluded$o);
    return jsxRuntimeExports.jsx("span", _objectSpread$o({
      ref,
      className: clsx("utrecht-data-placeholder", {
        "utrecht-data-placeholder--loading": loading
      }, className)
    }, restProps));
  });
  DataPlaceholder.displayName = "DataPlaceholder";
  var _excluded$n = ["children", "className"];
  function ownKeys$n(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread$n(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys$n(Object(t), true).forEach(function(r3) {
        _defineProperty(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$n(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  var PreHeading = /* @__PURE__ */ reactExports.forwardRef(function(_ref, ref) {
    var children = _ref.children, className = _ref.className, restProps = _objectWithoutProperties(_ref, _excluded$n);
    return jsxRuntimeExports.jsx("p", _objectSpread$n(_objectSpread$n({}, restProps), {}, {
      ref,
      className: clsx("utrecht-pre-heading", className),
      children
    }));
  });
  PreHeading.displayName = "PreHeading";
  var _excluded$m = ["children", "className", "dateTime", "value"];
  function ownKeys$m(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread$m(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys$m(Object(t), true).forEach(function(r3) {
        _defineProperty(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$m(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  var PreserveData = /* @__PURE__ */ reactExports.forwardRef(function(_ref, ref) {
    var children = _ref.children, className = _ref.className, dateTime = _ref.dateTime, value = _ref.value, restProps = _objectWithoutProperties(_ref, _excluded$m);
    var props = _objectSpread$m({
      children: jsxRuntimeExports.jsx("bdi", {
        translate: "no",
        children
      }),
      className: clsx("utrecht-preserve-data", className)
    }, restProps);
    return typeof dateTime !== "undefined" ? jsxRuntimeExports.jsx("time", _objectSpread$m(_objectSpread$m({}, props), {}, {
      dateTime,
      ref
    })) : typeof value !== "undefined" ? jsxRuntimeExports.jsx("data", _objectSpread$m(_objectSpread$m({}, props), {}, {
      value,
      ref
    })) : jsxRuntimeExports.jsx("bdi", _objectSpread$m(_objectSpread$m({
      translate: "no",
      ref
    }, props), {}, {
      children
    }));
  });
  PreserveData.displayName = "PreserveData";
  var _excluded$l = ["disabled", "required", "className", "invalid"];
  function ownKeys$l(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread$l(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys$l(Object(t), true).forEach(function(r3) {
        _defineProperty(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$l(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  var RadioButton = /* @__PURE__ */ reactExports.forwardRef(function(_ref, ref) {
    var disabled = _ref.disabled, required = _ref.required, className = _ref.className, invalid = _ref.invalid, restProps = _objectWithoutProperties(_ref, _excluded$l);
    return jsxRuntimeExports.jsx("input", _objectSpread$l({
      type: "radio",
      "aria-invalid": invalid || void 0,
      disabled,
      required,
      ref,
      className: clsx("utrecht-radio-button", "utrecht-radio-button--html-input", disabled && "utrecht-radio-button--disabled", invalid && "utrecht-radio-button--invalid", className)
    }, restProps));
  });
  RadioButton.displayName = "RadioButton";
  var _excluded$k = ["className", "children"];
  function ownKeys$k(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread$k(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys$k(Object(t), true).forEach(function(r3) {
        _defineProperty(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$k(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  var RichText = /* @__PURE__ */ reactExports.forwardRef(function(_ref, ref) {
    var className = _ref.className, children = _ref.children, restProps = _objectWithoutProperties(_ref, _excluded$k);
    return jsxRuntimeExports.jsx("div", _objectSpread$k(_objectSpread$k({}, restProps), {}, {
      ref,
      className: clsx("utrecht-rich-text", className),
      children
    }));
  });
  RichText.displayName = "RichText";
  var _excluded$j = ["busy", "invalid", "required", "className", "noscript", "children"], _excluded2 = ["disabled", "invalid", "value", "children", "className"];
  function ownKeys$j(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread$j(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys$j(Object(t), true).forEach(function(r3) {
        _defineProperty(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$j(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  var Select = /* @__PURE__ */ reactExports.forwardRef(function(_ref, ref) {
    var busy = _ref.busy, invalid = _ref.invalid, required = _ref.required, className = _ref.className, noscript = _ref.noscript, children = _ref.children, restProps = _objectWithoutProperties(_ref, _excluded$j);
    return jsxRuntimeExports.jsx("select", _objectSpread$j(_objectSpread$j({
      "aria-busy": busy || void 0,
      "aria-invalid": invalid || void 0,
      required: noscript ? required : false,
      "aria-required": noscript ? void 0 : required || void 0,
      className: clsx("utrecht-select", "utrecht-select--html-select", busy && "utrecht-select--busy", invalid && "utrecht-select--invalid", required && "utrecht-select--required", className),
      ref
    }, restProps), {}, {
      children
    }));
  });
  Select.displayName = "Select";
  var SelectOption = /* @__PURE__ */ reactExports.forwardRef(function(_ref2, ref) {
    var disabled = _ref2.disabled, invalid = _ref2.invalid, value = _ref2.value, children = _ref2.children, className = _ref2.className, restProps = _objectWithoutProperties(_ref2, _excluded2);
    return jsxRuntimeExports.jsx("option", _objectSpread$j(_objectSpread$j({}, restProps), {}, {
      ref,
      disabled,
      value,
      className: clsx("utrecht-select__option", disabled && "utrecht-select__option--disabled", invalid && "utrecht-select__option--invalid", className),
      children
    }));
  });
  SelectOption.displayName = "SelectOption";
  var _excluded$i = ["className", "children"];
  function ownKeys$i(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread$i(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys$i(Object(t), true).forEach(function(r3) {
        _defineProperty(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$i(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  var Separator = /* @__PURE__ */ reactExports.forwardRef(function(_ref, ref) {
    var className = _ref.className;
    _ref.children;
    var restProps = _objectWithoutProperties(_ref, _excluded$i);
    return jsxRuntimeExports.jsx("hr", _objectSpread$i(_objectSpread$i({}, restProps), {}, {
      ref,
      className: clsx("utrecht-separator", className)
    }));
  });
  Separator.displayName = "Separator";
  var _excluded$h = ["children", "className"];
  function ownKeys$h(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread$h(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys$h(Object(t), true).forEach(function(r3) {
        _defineProperty(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$h(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  var SkipLink = /* @__PURE__ */ reactExports.forwardRef(function(_ref, ref) {
    var children = _ref.children, className = _ref.className, restProps = _objectWithoutProperties(_ref, _excluded$h);
    return jsxRuntimeExports.jsx("p", {
      children: jsxRuntimeExports.jsx("a", _objectSpread$h(_objectSpread$h({
        ref
      }, restProps), {}, {
        className: clsx("utrecht-skip-link", "utrecht-skip-link--visible-on-focus", className),
        children
      }))
    });
  });
  SkipLink.displayName = "SkipLink";
  var _excluded$g = ["aside", "children", "className", "type"];
  function ownKeys$g(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread$g(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys$g(Object(t), true).forEach(function(r3) {
        _defineProperty(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$g(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  var SpotlightSection = /* @__PURE__ */ reactExports.forwardRef(function(_ref, ref) {
    var aside = _ref.aside, children = _ref.children, className = _ref.className, type = _ref.type, restProps = _objectWithoutProperties(_ref, _excluded$g);
    var props = _objectSpread$g(_objectSpread$g({}, restProps), {}, {
      ref,
      className: clsx("utrecht-spotlight-section", {
        "utrecht-spotlight-section--info": type === "info",
        "utrecht-spotlight-section--warning": type === "warning"
      }, className)
    });
    return aside ? jsxRuntimeExports.jsx("aside", _objectSpread$g(_objectSpread$g({}, props), {}, {
      children
    })) : jsxRuntimeExports.jsx("section", _objectSpread$g(_objectSpread$g({}, props), {}, {
      children
    }));
  });
  SpotlightSection.displayName = "SpotlightSection";
  var _excluded$f = ["className", "status"];
  function ownKeys$f(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread$f(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys$f(Object(t), true).forEach(function(r3) {
        _defineProperty(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$f(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  var StatusBadge = /* @__PURE__ */ reactExports.forwardRef(function(_ref, ref) {
    var className = _ref.className, status = _ref.status, restProps = _objectWithoutProperties(_ref, _excluded$f);
    return jsxRuntimeExports.jsx("span", _objectSpread$f(_objectSpread$f({
      className: clsx("utrecht-badge-status", "utrecht-badge-status--".concat(status ? status : "neutral"), className)
    }, restProps), {}, {
      ref
    }));
  });
  StatusBadge.displayName = "StatusBadge";
  var _excluded$e = ["children", "className"];
  function ownKeys$e(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread$e(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys$e(Object(t), true).forEach(function(r3) {
        _defineProperty(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$e(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  var Strong = /* @__PURE__ */ reactExports.forwardRef(function(_ref, ref) {
    var children = _ref.children, className = _ref.className, restProps = _objectWithoutProperties(_ref, _excluded$e);
    return jsxRuntimeExports.jsx("strong", _objectSpread$e(_objectSpread$e({
      ref,
      className: clsx("utrecht-emphasis", "utrecht-emphasis--strong", className)
    }, restProps), {}, {
      children
    }));
  });
  Strong.displayName = "Strong";
  var _excluded$d = ["children", "className"];
  function ownKeys$d(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread$d(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys$d(Object(t), true).forEach(function(r3) {
        _defineProperty(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$d(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  var Surface = /* @__PURE__ */ reactExports.forwardRef(function(_ref, ref) {
    var children = _ref.children, className = _ref.className, restProps = _objectWithoutProperties(_ref, _excluded$d);
    return jsxRuntimeExports.jsx("div", _objectSpread$d(_objectSpread$d({}, restProps), {}, {
      ref,
      className: clsx("utrecht-surface", className),
      children
    }));
  });
  Surface.displayName = "Surface";
  var _excluded$c = ["overflowInline", "children", "className"];
  function ownKeys$c(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread$c(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys$c(Object(t), true).forEach(function(r3) {
        _defineProperty(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$c(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  var TableContainer = /* @__PURE__ */ reactExports.forwardRef(function(_ref, ref) {
    var overflowInline = _ref.overflowInline, children = _ref.children, className = _ref.className, restProps = _objectWithoutProperties(_ref, _excluded$c);
    return jsxRuntimeExports.jsx("div", _objectSpread$c(_objectSpread$c({
      ref,
      className: clsx("utrecht-table-container", {
        "utrecht-table-container--overflow-inline": overflowInline
      }, className)
    }, restProps), {}, {
      children
    }));
  });
  TableContainer.displayName = "TableContainer";
  var _excluded$b = ["busy", "children", "className"];
  function ownKeys$b(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread$b(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys$b(Object(t), true).forEach(function(r3) {
        _defineProperty(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$b(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  var Table = /* @__PURE__ */ reactExports.forwardRef(function(_ref, ref) {
    var busy = _ref.busy, children = _ref.children, className = _ref.className, restProps = _objectWithoutProperties(_ref, _excluded$b);
    return jsxRuntimeExports.jsx("table", _objectSpread$b(_objectSpread$b({
      "aria-busy": busy
    }, restProps), {}, {
      ref,
      className: clsx("utrecht-table", {
        "utrecht-table--busy": busy
      }, className),
      children
    }));
  });
  Table.displayName = "Table";
  var _excluded$a = ["children", "className"];
  function ownKeys$a(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread$a(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys$a(Object(t), true).forEach(function(r3) {
        _defineProperty(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$a(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  var TableBody = /* @__PURE__ */ reactExports.forwardRef(function(_ref, ref) {
    var children = _ref.children, className = _ref.className, restProps = _objectWithoutProperties(_ref, _excluded$a);
    return jsxRuntimeExports.jsx("tbody", _objectSpread$a(_objectSpread$a({}, restProps), {}, {
      ref,
      className: clsx("utrecht-table__body", className),
      children
    }));
  });
  TableBody.displayName = "TableBody";
  var _excluded$9 = ["children", "className"];
  function ownKeys$9(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread$9(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys$9(Object(t), true).forEach(function(r3) {
        _defineProperty(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$9(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  var TableCaption = /* @__PURE__ */ reactExports.forwardRef(function(_ref, ref) {
    var children = _ref.children, className = _ref.className, restProps = _objectWithoutProperties(_ref, _excluded$9);
    return jsxRuntimeExports.jsx("caption", _objectSpread$9(_objectSpread$9({}, restProps), {}, {
      ref,
      className: clsx("utrecht-table__caption", className),
      children
    }));
  });
  TableCaption.displayName = "TableCaption";
  var _excluded$8 = ["children", "className", "numericColumn", "selected"];
  function ownKeys$8(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread$8(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys$8(Object(t), true).forEach(function(r3) {
        _defineProperty(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$8(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  var TableCell = /* @__PURE__ */ reactExports.forwardRef(function(_ref, ref) {
    var children = _ref.children, className = _ref.className, numericColumn = _ref.numericColumn, selected = _ref.selected, restProps = _objectWithoutProperties(_ref, _excluded$8);
    return jsxRuntimeExports.jsx("td", _objectSpread$8(_objectSpread$8({
      "aria-selected": selected ? true : void 0
    }, restProps), {}, {
      ref,
      className: clsx("utrecht-table__cell", {
        "utrecht-table__cell--selected": selected,
        "utrecht-table__cell--numeric-column": numericColumn
      }, className),
      children
    }));
  });
  TableCell.displayName = "TableCell";
  var _excluded$7 = ["children", "className", "sticky"];
  function ownKeys$7(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread$7(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys$7(Object(t), true).forEach(function(r3) {
        _defineProperty(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$7(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  var TableFooter = /* @__PURE__ */ reactExports.forwardRef(function(_ref, ref) {
    var children = _ref.children, className = _ref.className, sticky = _ref.sticky, restProps = _objectWithoutProperties(_ref, _excluded$7);
    return jsxRuntimeExports.jsx("tfoot", _objectSpread$7(_objectSpread$7({}, restProps), {}, {
      ref,
      className: clsx("utrecht-table__footer", {
        "utrecht-table__footer--sticky": sticky
      }, className),
      children
    }));
  });
  TableFooter.displayName = "TableFooter";
  var _excluded$6 = ["children", "className", "sticky"];
  function ownKeys$6(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread$6(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys$6(Object(t), true).forEach(function(r3) {
        _defineProperty(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$6(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  var TableHeader = /* @__PURE__ */ reactExports.forwardRef(function(_ref, ref) {
    var children = _ref.children, className = _ref.className, sticky = _ref.sticky, restProps = _objectWithoutProperties(_ref, _excluded$6);
    return jsxRuntimeExports.jsx("thead", _objectSpread$6(_objectSpread$6({}, restProps), {}, {
      ref,
      className: clsx("utrecht-table__header", {
        "utrecht-table__header--sticky": sticky
      }, className),
      children
    }));
  });
  TableHeader.displayName = "TableHeader";
  var _excluded$5 = ["children", "className", "numericColumn", "selected", "sticky", "scope"];
  function ownKeys$5(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread$5(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys$5(Object(t), true).forEach(function(r3) {
        _defineProperty(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$5(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  var TableHeaderCell = /* @__PURE__ */ reactExports.forwardRef(function(_ref, ref) {
    var children = _ref.children, className = _ref.className, numericColumn = _ref.numericColumn, selected = _ref.selected, sticky = _ref.sticky, scope = _ref.scope, restProps = _objectWithoutProperties(_ref, _excluded$5);
    return jsxRuntimeExports.jsx("th", _objectSpread$5(_objectSpread$5({
      "aria-selected": selected ? true : void 0,
      scope
    }, restProps), {}, {
      ref,
      className: clsx("utrecht-table__header-cell", {
        "utrecht-table__header-cell--numeric-column": numericColumn,
        "utrecht-table__header-cell--selected": selected,
        "utrecht-table__header-cell--sticky-inline": sticky && scope === "row",
        "utrecht-table__header-cell--sticky-block": sticky && scope === "col"
      }, className),
      children
    }));
  });
  TableHeaderCell.displayName = "TableHeaderCell";
  var _excluded$4 = ["children", "className", "selected"];
  function ownKeys$4(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread$4(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys$4(Object(t), true).forEach(function(r3) {
        _defineProperty(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$4(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  var TableRow = /* @__PURE__ */ reactExports.forwardRef(function(_ref, ref) {
    var children = _ref.children, className = _ref.className, selected = _ref.selected, restProps = _objectWithoutProperties(_ref, _excluded$4);
    return jsxRuntimeExports.jsx("tr", _objectSpread$4(_objectSpread$4({
      "aria-selected": selected ? true : void 0
    }, restProps), {}, {
      ref,
      className: clsx("utrecht-table__row", {
        "utrecht-table__row--selected": selected
      }, className),
      children
    }));
  });
  TableRow.displayName = "TableRow";
  var _excluded$3 = ["dir", "disabled", "invalid", "readOnly", "required", "className"];
  function ownKeys$3(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread$3(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys$3(Object(t), true).forEach(function(r3) {
        _defineProperty(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$3(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  var Textarea = /* @__PURE__ */ reactExports.forwardRef(function(_ref, ref) {
    var dir = _ref.dir, disabled = _ref.disabled, invalid = _ref.invalid, readOnly = _ref.readOnly, required = _ref.required, className = _ref.className, restProps = _objectWithoutProperties(_ref, _excluded$3);
    return jsxRuntimeExports.jsx("textarea", _objectSpread$3(_objectSpread$3({}, restProps), {}, {
      ref,
      className: clsx("utrecht-textarea", "utrecht-textarea--html-textarea", disabled && "utrecht-textarea--disabled", invalid && "utrecht-textarea--invalid", readOnly && "utrecht-textarea--readonly", required && "utrecht-textarea--required", className),
      dir: dir !== null && dir !== void 0 ? dir : "auto",
      disabled,
      readOnly,
      required,
      "aria-invalid": invalid || void 0
    }));
  });
  Textarea.displayName = "Textarea";
  var _excluded$2 = ["children", "className"];
  function ownKeys$2(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread$2(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys$2(Object(t), true).forEach(function(r3) {
        _defineProperty(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$2(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  var URLData = /* @__PURE__ */ reactExports.forwardRef(function(_ref, ref) {
    var children = _ref.children, className = _ref.className, restProps = _objectWithoutProperties(_ref, _excluded$2);
    return jsxRuntimeExports.jsx("bdi", _objectSpread$2(_objectSpread$2({
      translate: "no"
    }, restProps), {}, {
      ref,
      className: clsx("utrecht-url-data", className),
      children
    }));
  });
  URLData.displayName = "URLData";
  var _excluded$1 = ["children", "className"];
  function ownKeys$1(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread$1(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys$1(Object(t), true).forEach(function(r3) {
        _defineProperty(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$1(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  var UnorderedList = /* @__PURE__ */ reactExports.forwardRef(function(_ref, ref) {
    var children = _ref.children, className = _ref.className, restProps = _objectWithoutProperties(_ref, _excluded$1);
    return jsxRuntimeExports.jsx("ul", _objectSpread$1(_objectSpread$1({
      role: "list"
    }, restProps), {}, {
      ref,
      className: clsx("utrecht-unordered-list", className),
      children
    }));
  });
  UnorderedList.displayName = "UnorderedList";
  var _excluded = ["children", "className"];
  function ownKeys(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys(Object(t), true).forEach(function(r3) {
        _defineProperty(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  var UnorderedListItem = /* @__PURE__ */ reactExports.forwardRef(function(_ref, ref) {
    var children = _ref.children, className = _ref.className, restProps = _objectWithoutProperties(_ref, _excluded);
    return jsxRuntimeExports.jsx("li", _objectSpread(_objectSpread({}, restProps), {}, {
      ref,
      className: clsx("utrecht-unordered-list__item", className),
      children
    }));
  });
  UnorderedListItem.displayName = "UnorderedListItem";
  var client = {};
  var reactDom = { exports: {} };
  var reactDom_production_min = {};
  var scheduler = { exports: {} };
  var scheduler_production_min = {};
  /**
   * @license React
   * scheduler.production.min.js
   *
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   */
  var hasRequiredScheduler_production_min;
  function requireScheduler_production_min() {
    if (hasRequiredScheduler_production_min) return scheduler_production_min;
    hasRequiredScheduler_production_min = 1;
    (function(exports$1) {
      function f(a, b) {
        var c = a.length;
        a.push(b);
        a: for (; 0 < c; ) {
          var d = c - 1 >>> 1, e = a[d];
          if (0 < g(e, b)) a[d] = b, a[c] = e, c = d;
          else break a;
        }
      }
      function h(a) {
        return 0 === a.length ? null : a[0];
      }
      function k(a) {
        if (0 === a.length) return null;
        var b = a[0], c = a.pop();
        if (c !== b) {
          a[0] = c;
          a: for (var d = 0, e = a.length, w = e >>> 1; d < w; ) {
            var m = 2 * (d + 1) - 1, C = a[m], n = m + 1, x = a[n];
            if (0 > g(C, c)) n < e && 0 > g(x, C) ? (a[d] = x, a[n] = c, d = n) : (a[d] = C, a[m] = c, d = m);
            else if (n < e && 0 > g(x, c)) a[d] = x, a[n] = c, d = n;
            else break a;
          }
        }
        return b;
      }
      function g(a, b) {
        var c = a.sortIndex - b.sortIndex;
        return 0 !== c ? c : a.id - b.id;
      }
      if ("object" === typeof performance && "function" === typeof performance.now) {
        var l = performance;
        exports$1.unstable_now = function() {
          return l.now();
        };
      } else {
        var p = Date, q = p.now();
        exports$1.unstable_now = function() {
          return p.now() - q;
        };
      }
      var r2 = [], t = [], u = 1, v = null, y = 3, z = false, A = false, B = false, D = "function" === typeof setTimeout ? setTimeout : null, E = "function" === typeof clearTimeout ? clearTimeout : null, F = "undefined" !== typeof setImmediate ? setImmediate : null;
      "undefined" !== typeof navigator && void 0 !== navigator.scheduling && void 0 !== navigator.scheduling.isInputPending && navigator.scheduling.isInputPending.bind(navigator.scheduling);
      function G(a) {
        for (var b = h(t); null !== b; ) {
          if (null === b.callback) k(t);
          else if (b.startTime <= a) k(t), b.sortIndex = b.expirationTime, f(r2, b);
          else break;
          b = h(t);
        }
      }
      function H(a) {
        B = false;
        G(a);
        if (!A) if (null !== h(r2)) A = true, I(J);
        else {
          var b = h(t);
          null !== b && K(H, b.startTime - a);
        }
      }
      function J(a, b) {
        A = false;
        B && (B = false, E(L), L = -1);
        z = true;
        var c = y;
        try {
          G(b);
          for (v = h(r2); null !== v && (!(v.expirationTime > b) || a && !M()); ) {
            var d = v.callback;
            if ("function" === typeof d) {
              v.callback = null;
              y = v.priorityLevel;
              var e = d(v.expirationTime <= b);
              b = exports$1.unstable_now();
              "function" === typeof e ? v.callback = e : v === h(r2) && k(r2);
              G(b);
            } else k(r2);
            v = h(r2);
          }
          if (null !== v) var w = true;
          else {
            var m = h(t);
            null !== m && K(H, m.startTime - b);
            w = false;
          }
          return w;
        } finally {
          v = null, y = c, z = false;
        }
      }
      var N = false, O = null, L = -1, P = 5, Q = -1;
      function M() {
        return exports$1.unstable_now() - Q < P ? false : true;
      }
      function R() {
        if (null !== O) {
          var a = exports$1.unstable_now();
          Q = a;
          var b = true;
          try {
            b = O(true, a);
          } finally {
            b ? S() : (N = false, O = null);
          }
        } else N = false;
      }
      var S;
      if ("function" === typeof F) S = function() {
        F(R);
      };
      else if ("undefined" !== typeof MessageChannel) {
        var T = new MessageChannel(), U = T.port2;
        T.port1.onmessage = R;
        S = function() {
          U.postMessage(null);
        };
      } else S = function() {
        D(R, 0);
      };
      function I(a) {
        O = a;
        N || (N = true, S());
      }
      function K(a, b) {
        L = D(function() {
          a(exports$1.unstable_now());
        }, b);
      }
      exports$1.unstable_IdlePriority = 5;
      exports$1.unstable_ImmediatePriority = 1;
      exports$1.unstable_LowPriority = 4;
      exports$1.unstable_NormalPriority = 3;
      exports$1.unstable_Profiling = null;
      exports$1.unstable_UserBlockingPriority = 2;
      exports$1.unstable_cancelCallback = function(a) {
        a.callback = null;
      };
      exports$1.unstable_continueExecution = function() {
        A || z || (A = true, I(J));
      };
      exports$1.unstable_forceFrameRate = function(a) {
        0 > a || 125 < a ? console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported") : P = 0 < a ? Math.floor(1e3 / a) : 5;
      };
      exports$1.unstable_getCurrentPriorityLevel = function() {
        return y;
      };
      exports$1.unstable_getFirstCallbackNode = function() {
        return h(r2);
      };
      exports$1.unstable_next = function(a) {
        switch (y) {
          case 1:
          case 2:
          case 3:
            var b = 3;
            break;
          default:
            b = y;
        }
        var c = y;
        y = b;
        try {
          return a();
        } finally {
          y = c;
        }
      };
      exports$1.unstable_pauseExecution = function() {
      };
      exports$1.unstable_requestPaint = function() {
      };
      exports$1.unstable_runWithPriority = function(a, b) {
        switch (a) {
          case 1:
          case 2:
          case 3:
          case 4:
          case 5:
            break;
          default:
            a = 3;
        }
        var c = y;
        y = a;
        try {
          return b();
        } finally {
          y = c;
        }
      };
      exports$1.unstable_scheduleCallback = function(a, b, c) {
        var d = exports$1.unstable_now();
        "object" === typeof c && null !== c ? (c = c.delay, c = "number" === typeof c && 0 < c ? d + c : d) : c = d;
        switch (a) {
          case 1:
            var e = -1;
            break;
          case 2:
            e = 250;
            break;
          case 5:
            e = 1073741823;
            break;
          case 4:
            e = 1e4;
            break;
          default:
            e = 5e3;
        }
        e = c + e;
        a = { id: u++, callback: b, priorityLevel: a, startTime: c, expirationTime: e, sortIndex: -1 };
        c > d ? (a.sortIndex = c, f(t, a), null === h(r2) && a === h(t) && (B ? (E(L), L = -1) : B = true, K(H, c - d))) : (a.sortIndex = e, f(r2, a), A || z || (A = true, I(J)));
        return a;
      };
      exports$1.unstable_shouldYield = M;
      exports$1.unstable_wrapCallback = function(a) {
        var b = y;
        return function() {
          var c = y;
          y = b;
          try {
            return a.apply(this, arguments);
          } finally {
            y = c;
          }
        };
      };
    })(scheduler_production_min);
    return scheduler_production_min;
  }
  var hasRequiredScheduler;
  function requireScheduler() {
    if (hasRequiredScheduler) return scheduler.exports;
    hasRequiredScheduler = 1;
    {
      scheduler.exports = requireScheduler_production_min();
    }
    return scheduler.exports;
  }
  /**
   * @license React
   * react-dom.production.min.js
   *
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   */
  var hasRequiredReactDom_production_min;
  function requireReactDom_production_min() {
    if (hasRequiredReactDom_production_min) return reactDom_production_min;
    hasRequiredReactDom_production_min = 1;
    var aa = requireReact(), ca = requireScheduler();
    function p(a) {
      for (var b = "https://reactjs.org/docs/error-decoder.html?invariant=" + a, c = 1; c < arguments.length; c++) b += "&args[]=" + encodeURIComponent(arguments[c]);
      return "Minified React error #" + a + "; visit " + b + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
    }
    var da = /* @__PURE__ */ new Set(), ea = {};
    function fa(a, b) {
      ha(a, b);
      ha(a + "Capture", b);
    }
    function ha(a, b) {
      ea[a] = b;
      for (a = 0; a < b.length; a++) da.add(b[a]);
    }
    var ia = !("undefined" === typeof window || "undefined" === typeof window.document || "undefined" === typeof window.document.createElement), ja = Object.prototype.hasOwnProperty, ka = /^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/, la = {}, ma = {};
    function oa(a) {
      if (ja.call(ma, a)) return true;
      if (ja.call(la, a)) return false;
      if (ka.test(a)) return ma[a] = true;
      la[a] = true;
      return false;
    }
    function pa(a, b, c, d) {
      if (null !== c && 0 === c.type) return false;
      switch (typeof b) {
        case "function":
        case "symbol":
          return true;
        case "boolean":
          if (d) return false;
          if (null !== c) return !c.acceptsBooleans;
          a = a.toLowerCase().slice(0, 5);
          return "data-" !== a && "aria-" !== a;
        default:
          return false;
      }
    }
    function qa(a, b, c, d) {
      if (null === b || "undefined" === typeof b || pa(a, b, c, d)) return true;
      if (d) return false;
      if (null !== c) switch (c.type) {
        case 3:
          return !b;
        case 4:
          return false === b;
        case 5:
          return isNaN(b);
        case 6:
          return isNaN(b) || 1 > b;
      }
      return false;
    }
    function v(a, b, c, d, e, f, g) {
      this.acceptsBooleans = 2 === b || 3 === b || 4 === b;
      this.attributeName = d;
      this.attributeNamespace = e;
      this.mustUseProperty = c;
      this.propertyName = a;
      this.type = b;
      this.sanitizeURL = f;
      this.removeEmptyString = g;
    }
    var z = {};
    "children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(a) {
      z[a] = new v(a, 0, false, a, null, false, false);
    });
    [["acceptCharset", "accept-charset"], ["className", "class"], ["htmlFor", "for"], ["httpEquiv", "http-equiv"]].forEach(function(a) {
      var b = a[0];
      z[b] = new v(b, 1, false, a[1], null, false, false);
    });
    ["contentEditable", "draggable", "spellCheck", "value"].forEach(function(a) {
      z[a] = new v(a, 2, false, a.toLowerCase(), null, false, false);
    });
    ["autoReverse", "externalResourcesRequired", "focusable", "preserveAlpha"].forEach(function(a) {
      z[a] = new v(a, 2, false, a, null, false, false);
    });
    "allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(a) {
      z[a] = new v(a, 3, false, a.toLowerCase(), null, false, false);
    });
    ["checked", "multiple", "muted", "selected"].forEach(function(a) {
      z[a] = new v(a, 3, true, a, null, false, false);
    });
    ["capture", "download"].forEach(function(a) {
      z[a] = new v(a, 4, false, a, null, false, false);
    });
    ["cols", "rows", "size", "span"].forEach(function(a) {
      z[a] = new v(a, 6, false, a, null, false, false);
    });
    ["rowSpan", "start"].forEach(function(a) {
      z[a] = new v(a, 5, false, a.toLowerCase(), null, false, false);
    });
    var ra = /[\-:]([a-z])/g;
    function sa(a) {
      return a[1].toUpperCase();
    }
    "accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(a) {
      var b = a.replace(
        ra,
        sa
      );
      z[b] = new v(b, 1, false, a, null, false, false);
    });
    "xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(a) {
      var b = a.replace(ra, sa);
      z[b] = new v(b, 1, false, a, "http://www.w3.org/1999/xlink", false, false);
    });
    ["xml:base", "xml:lang", "xml:space"].forEach(function(a) {
      var b = a.replace(ra, sa);
      z[b] = new v(b, 1, false, a, "http://www.w3.org/XML/1998/namespace", false, false);
    });
    ["tabIndex", "crossOrigin"].forEach(function(a) {
      z[a] = new v(a, 1, false, a.toLowerCase(), null, false, false);
    });
    z.xlinkHref = new v("xlinkHref", 1, false, "xlink:href", "http://www.w3.org/1999/xlink", true, false);
    ["src", "href", "action", "formAction"].forEach(function(a) {
      z[a] = new v(a, 1, false, a.toLowerCase(), null, true, true);
    });
    function ta(a, b, c, d) {
      var e = z.hasOwnProperty(b) ? z[b] : null;
      if (null !== e ? 0 !== e.type : d || !(2 < b.length) || "o" !== b[0] && "O" !== b[0] || "n" !== b[1] && "N" !== b[1]) qa(b, c, e, d) && (c = null), d || null === e ? oa(b) && (null === c ? a.removeAttribute(b) : a.setAttribute(b, "" + c)) : e.mustUseProperty ? a[e.propertyName] = null === c ? 3 === e.type ? false : "" : c : (b = e.attributeName, d = e.attributeNamespace, null === c ? a.removeAttribute(b) : (e = e.type, c = 3 === e || 4 === e && true === c ? "" : "" + c, d ? a.setAttributeNS(d, b, c) : a.setAttribute(b, c)));
    }
    var ua = aa.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED, va = Symbol.for("react.element"), wa = Symbol.for("react.portal"), ya = Symbol.for("react.fragment"), za = Symbol.for("react.strict_mode"), Aa = Symbol.for("react.profiler"), Ba = Symbol.for("react.provider"), Ca = Symbol.for("react.context"), Da = Symbol.for("react.forward_ref"), Ea = Symbol.for("react.suspense"), Fa = Symbol.for("react.suspense_list"), Ga = Symbol.for("react.memo"), Ha = Symbol.for("react.lazy");
    var Ia = Symbol.for("react.offscreen");
    var Ja = Symbol.iterator;
    function Ka(a) {
      if (null === a || "object" !== typeof a) return null;
      a = Ja && a[Ja] || a["@@iterator"];
      return "function" === typeof a ? a : null;
    }
    var A = Object.assign, La;
    function Ma(a) {
      if (void 0 === La) try {
        throw Error();
      } catch (c) {
        var b = c.stack.trim().match(/\n( *(at )?)/);
        La = b && b[1] || "";
      }
      return "\n" + La + a;
    }
    var Na = false;
    function Oa(a, b) {
      if (!a || Na) return "";
      Na = true;
      var c = Error.prepareStackTrace;
      Error.prepareStackTrace = void 0;
      try {
        if (b) if (b = function() {
          throw Error();
        }, Object.defineProperty(b.prototype, "props", { set: function() {
          throw Error();
        } }), "object" === typeof Reflect && Reflect.construct) {
          try {
            Reflect.construct(b, []);
          } catch (l) {
            var d = l;
          }
          Reflect.construct(a, [], b);
        } else {
          try {
            b.call();
          } catch (l) {
            d = l;
          }
          a.call(b.prototype);
        }
        else {
          try {
            throw Error();
          } catch (l) {
            d = l;
          }
          a();
        }
      } catch (l) {
        if (l && d && "string" === typeof l.stack) {
          for (var e = l.stack.split("\n"), f = d.stack.split("\n"), g = e.length - 1, h = f.length - 1; 1 <= g && 0 <= h && e[g] !== f[h]; ) h--;
          for (; 1 <= g && 0 <= h; g--, h--) if (e[g] !== f[h]) {
            if (1 !== g || 1 !== h) {
              do
                if (g--, h--, 0 > h || e[g] !== f[h]) {
                  var k = "\n" + e[g].replace(" at new ", " at ");
                  a.displayName && k.includes("<anonymous>") && (k = k.replace("<anonymous>", a.displayName));
                  return k;
                }
              while (1 <= g && 0 <= h);
            }
            break;
          }
        }
      } finally {
        Na = false, Error.prepareStackTrace = c;
      }
      return (a = a ? a.displayName || a.name : "") ? Ma(a) : "";
    }
    function Pa(a) {
      switch (a.tag) {
        case 5:
          return Ma(a.type);
        case 16:
          return Ma("Lazy");
        case 13:
          return Ma("Suspense");
        case 19:
          return Ma("SuspenseList");
        case 0:
        case 2:
        case 15:
          return a = Oa(a.type, false), a;
        case 11:
          return a = Oa(a.type.render, false), a;
        case 1:
          return a = Oa(a.type, true), a;
        default:
          return "";
      }
    }
    function Qa(a) {
      if (null == a) return null;
      if ("function" === typeof a) return a.displayName || a.name || null;
      if ("string" === typeof a) return a;
      switch (a) {
        case ya:
          return "Fragment";
        case wa:
          return "Portal";
        case Aa:
          return "Profiler";
        case za:
          return "StrictMode";
        case Ea:
          return "Suspense";
        case Fa:
          return "SuspenseList";
      }
      if ("object" === typeof a) switch (a.$$typeof) {
        case Ca:
          return (a.displayName || "Context") + ".Consumer";
        case Ba:
          return (a._context.displayName || "Context") + ".Provider";
        case Da:
          var b = a.render;
          a = a.displayName;
          a || (a = b.displayName || b.name || "", a = "" !== a ? "ForwardRef(" + a + ")" : "ForwardRef");
          return a;
        case Ga:
          return b = a.displayName || null, null !== b ? b : Qa(a.type) || "Memo";
        case Ha:
          b = a._payload;
          a = a._init;
          try {
            return Qa(a(b));
          } catch (c) {
          }
      }
      return null;
    }
    function Ra(a) {
      var b = a.type;
      switch (a.tag) {
        case 24:
          return "Cache";
        case 9:
          return (b.displayName || "Context") + ".Consumer";
        case 10:
          return (b._context.displayName || "Context") + ".Provider";
        case 18:
          return "DehydratedFragment";
        case 11:
          return a = b.render, a = a.displayName || a.name || "", b.displayName || ("" !== a ? "ForwardRef(" + a + ")" : "ForwardRef");
        case 7:
          return "Fragment";
        case 5:
          return b;
        case 4:
          return "Portal";
        case 3:
          return "Root";
        case 6:
          return "Text";
        case 16:
          return Qa(b);
        case 8:
          return b === za ? "StrictMode" : "Mode";
        case 22:
          return "Offscreen";
        case 12:
          return "Profiler";
        case 21:
          return "Scope";
        case 13:
          return "Suspense";
        case 19:
          return "SuspenseList";
        case 25:
          return "TracingMarker";
        case 1:
        case 0:
        case 17:
        case 2:
        case 14:
        case 15:
          if ("function" === typeof b) return b.displayName || b.name || null;
          if ("string" === typeof b) return b;
      }
      return null;
    }
    function Sa(a) {
      switch (typeof a) {
        case "boolean":
        case "number":
        case "string":
        case "undefined":
          return a;
        case "object":
          return a;
        default:
          return "";
      }
    }
    function Ta(a) {
      var b = a.type;
      return (a = a.nodeName) && "input" === a.toLowerCase() && ("checkbox" === b || "radio" === b);
    }
    function Ua(a) {
      var b = Ta(a) ? "checked" : "value", c = Object.getOwnPropertyDescriptor(a.constructor.prototype, b), d = "" + a[b];
      if (!a.hasOwnProperty(b) && "undefined" !== typeof c && "function" === typeof c.get && "function" === typeof c.set) {
        var e = c.get, f = c.set;
        Object.defineProperty(a, b, { configurable: true, get: function() {
          return e.call(this);
        }, set: function(a2) {
          d = "" + a2;
          f.call(this, a2);
        } });
        Object.defineProperty(a, b, { enumerable: c.enumerable });
        return { getValue: function() {
          return d;
        }, setValue: function(a2) {
          d = "" + a2;
        }, stopTracking: function() {
          a._valueTracker = null;
          delete a[b];
        } };
      }
    }
    function Va(a) {
      a._valueTracker || (a._valueTracker = Ua(a));
    }
    function Wa(a) {
      if (!a) return false;
      var b = a._valueTracker;
      if (!b) return true;
      var c = b.getValue();
      var d = "";
      a && (d = Ta(a) ? a.checked ? "true" : "false" : a.value);
      a = d;
      return a !== c ? (b.setValue(a), true) : false;
    }
    function Xa(a) {
      a = a || ("undefined" !== typeof document ? document : void 0);
      if ("undefined" === typeof a) return null;
      try {
        return a.activeElement || a.body;
      } catch (b) {
        return a.body;
      }
    }
    function Ya(a, b) {
      var c = b.checked;
      return A({}, b, { defaultChecked: void 0, defaultValue: void 0, value: void 0, checked: null != c ? c : a._wrapperState.initialChecked });
    }
    function Za(a, b) {
      var c = null == b.defaultValue ? "" : b.defaultValue, d = null != b.checked ? b.checked : b.defaultChecked;
      c = Sa(null != b.value ? b.value : c);
      a._wrapperState = { initialChecked: d, initialValue: c, controlled: "checkbox" === b.type || "radio" === b.type ? null != b.checked : null != b.value };
    }
    function ab(a, b) {
      b = b.checked;
      null != b && ta(a, "checked", b, false);
    }
    function bb(a, b) {
      ab(a, b);
      var c = Sa(b.value), d = b.type;
      if (null != c) if ("number" === d) {
        if (0 === c && "" === a.value || a.value != c) a.value = "" + c;
      } else a.value !== "" + c && (a.value = "" + c);
      else if ("submit" === d || "reset" === d) {
        a.removeAttribute("value");
        return;
      }
      b.hasOwnProperty("value") ? cb(a, b.type, c) : b.hasOwnProperty("defaultValue") && cb(a, b.type, Sa(b.defaultValue));
      null == b.checked && null != b.defaultChecked && (a.defaultChecked = !!b.defaultChecked);
    }
    function db(a, b, c) {
      if (b.hasOwnProperty("value") || b.hasOwnProperty("defaultValue")) {
        var d = b.type;
        if (!("submit" !== d && "reset" !== d || void 0 !== b.value && null !== b.value)) return;
        b = "" + a._wrapperState.initialValue;
        c || b === a.value || (a.value = b);
        a.defaultValue = b;
      }
      c = a.name;
      "" !== c && (a.name = "");
      a.defaultChecked = !!a._wrapperState.initialChecked;
      "" !== c && (a.name = c);
    }
    function cb(a, b, c) {
      if ("number" !== b || Xa(a.ownerDocument) !== a) null == c ? a.defaultValue = "" + a._wrapperState.initialValue : a.defaultValue !== "" + c && (a.defaultValue = "" + c);
    }
    var eb = Array.isArray;
    function fb(a, b, c, d) {
      a = a.options;
      if (b) {
        b = {};
        for (var e = 0; e < c.length; e++) b["$" + c[e]] = true;
        for (c = 0; c < a.length; c++) e = b.hasOwnProperty("$" + a[c].value), a[c].selected !== e && (a[c].selected = e), e && d && (a[c].defaultSelected = true);
      } else {
        c = "" + Sa(c);
        b = null;
        for (e = 0; e < a.length; e++) {
          if (a[e].value === c) {
            a[e].selected = true;
            d && (a[e].defaultSelected = true);
            return;
          }
          null !== b || a[e].disabled || (b = a[e]);
        }
        null !== b && (b.selected = true);
      }
    }
    function gb(a, b) {
      if (null != b.dangerouslySetInnerHTML) throw Error(p(91));
      return A({}, b, { value: void 0, defaultValue: void 0, children: "" + a._wrapperState.initialValue });
    }
    function hb(a, b) {
      var c = b.value;
      if (null == c) {
        c = b.children;
        b = b.defaultValue;
        if (null != c) {
          if (null != b) throw Error(p(92));
          if (eb(c)) {
            if (1 < c.length) throw Error(p(93));
            c = c[0];
          }
          b = c;
        }
        null == b && (b = "");
        c = b;
      }
      a._wrapperState = { initialValue: Sa(c) };
    }
    function ib(a, b) {
      var c = Sa(b.value), d = Sa(b.defaultValue);
      null != c && (c = "" + c, c !== a.value && (a.value = c), null == b.defaultValue && a.defaultValue !== c && (a.defaultValue = c));
      null != d && (a.defaultValue = "" + d);
    }
    function jb(a) {
      var b = a.textContent;
      b === a._wrapperState.initialValue && "" !== b && null !== b && (a.value = b);
    }
    function kb(a) {
      switch (a) {
        case "svg":
          return "http://www.w3.org/2000/svg";
        case "math":
          return "http://www.w3.org/1998/Math/MathML";
        default:
          return "http://www.w3.org/1999/xhtml";
      }
    }
    function lb(a, b) {
      return null == a || "http://www.w3.org/1999/xhtml" === a ? kb(b) : "http://www.w3.org/2000/svg" === a && "foreignObject" === b ? "http://www.w3.org/1999/xhtml" : a;
    }
    var mb, nb = (function(a) {
      return "undefined" !== typeof MSApp && MSApp.execUnsafeLocalFunction ? function(b, c, d, e) {
        MSApp.execUnsafeLocalFunction(function() {
          return a(b, c, d, e);
        });
      } : a;
    })(function(a, b) {
      if ("http://www.w3.org/2000/svg" !== a.namespaceURI || "innerHTML" in a) a.innerHTML = b;
      else {
        mb = mb || document.createElement("div");
        mb.innerHTML = "<svg>" + b.valueOf().toString() + "</svg>";
        for (b = mb.firstChild; a.firstChild; ) a.removeChild(a.firstChild);
        for (; b.firstChild; ) a.appendChild(b.firstChild);
      }
    });
    function ob(a, b) {
      if (b) {
        var c = a.firstChild;
        if (c && c === a.lastChild && 3 === c.nodeType) {
          c.nodeValue = b;
          return;
        }
      }
      a.textContent = b;
    }
    var pb = {
      animationIterationCount: true,
      aspectRatio: true,
      borderImageOutset: true,
      borderImageSlice: true,
      borderImageWidth: true,
      boxFlex: true,
      boxFlexGroup: true,
      boxOrdinalGroup: true,
      columnCount: true,
      columns: true,
      flex: true,
      flexGrow: true,
      flexPositive: true,
      flexShrink: true,
      flexNegative: true,
      flexOrder: true,
      gridArea: true,
      gridRow: true,
      gridRowEnd: true,
      gridRowSpan: true,
      gridRowStart: true,
      gridColumn: true,
      gridColumnEnd: true,
      gridColumnSpan: true,
      gridColumnStart: true,
      fontWeight: true,
      lineClamp: true,
      lineHeight: true,
      opacity: true,
      order: true,
      orphans: true,
      tabSize: true,
      widows: true,
      zIndex: true,
      zoom: true,
      fillOpacity: true,
      floodOpacity: true,
      stopOpacity: true,
      strokeDasharray: true,
      strokeDashoffset: true,
      strokeMiterlimit: true,
      strokeOpacity: true,
      strokeWidth: true
    }, qb = ["Webkit", "ms", "Moz", "O"];
    Object.keys(pb).forEach(function(a) {
      qb.forEach(function(b) {
        b = b + a.charAt(0).toUpperCase() + a.substring(1);
        pb[b] = pb[a];
      });
    });
    function rb(a, b, c) {
      return null == b || "boolean" === typeof b || "" === b ? "" : c || "number" !== typeof b || 0 === b || pb.hasOwnProperty(a) && pb[a] ? ("" + b).trim() : b + "px";
    }
    function sb(a, b) {
      a = a.style;
      for (var c in b) if (b.hasOwnProperty(c)) {
        var d = 0 === c.indexOf("--"), e = rb(c, b[c], d);
        "float" === c && (c = "cssFloat");
        d ? a.setProperty(c, e) : a[c] = e;
      }
    }
    var tb = A({ menuitem: true }, { area: true, base: true, br: true, col: true, embed: true, hr: true, img: true, input: true, keygen: true, link: true, meta: true, param: true, source: true, track: true, wbr: true });
    function ub(a, b) {
      if (b) {
        if (tb[a] && (null != b.children || null != b.dangerouslySetInnerHTML)) throw Error(p(137, a));
        if (null != b.dangerouslySetInnerHTML) {
          if (null != b.children) throw Error(p(60));
          if ("object" !== typeof b.dangerouslySetInnerHTML || !("__html" in b.dangerouslySetInnerHTML)) throw Error(p(61));
        }
        if (null != b.style && "object" !== typeof b.style) throw Error(p(62));
      }
    }
    function vb(a, b) {
      if (-1 === a.indexOf("-")) return "string" === typeof b.is;
      switch (a) {
        case "annotation-xml":
        case "color-profile":
        case "font-face":
        case "font-face-src":
        case "font-face-uri":
        case "font-face-format":
        case "font-face-name":
        case "missing-glyph":
          return false;
        default:
          return true;
      }
    }
    var wb = null;
    function xb(a) {
      a = a.target || a.srcElement || window;
      a.correspondingUseElement && (a = a.correspondingUseElement);
      return 3 === a.nodeType ? a.parentNode : a;
    }
    var yb = null, zb = null, Ab = null;
    function Bb(a) {
      if (a = Cb(a)) {
        if ("function" !== typeof yb) throw Error(p(280));
        var b = a.stateNode;
        b && (b = Db(b), yb(a.stateNode, a.type, b));
      }
    }
    function Eb(a) {
      zb ? Ab ? Ab.push(a) : Ab = [a] : zb = a;
    }
    function Fb() {
      if (zb) {
        var a = zb, b = Ab;
        Ab = zb = null;
        Bb(a);
        if (b) for (a = 0; a < b.length; a++) Bb(b[a]);
      }
    }
    function Gb(a, b) {
      return a(b);
    }
    function Hb() {
    }
    var Ib = false;
    function Jb(a, b, c) {
      if (Ib) return a(b, c);
      Ib = true;
      try {
        return Gb(a, b, c);
      } finally {
        if (Ib = false, null !== zb || null !== Ab) Hb(), Fb();
      }
    }
    function Kb(a, b) {
      var c = a.stateNode;
      if (null === c) return null;
      var d = Db(c);
      if (null === d) return null;
      c = d[b];
      a: switch (b) {
        case "onClick":
        case "onClickCapture":
        case "onDoubleClick":
        case "onDoubleClickCapture":
        case "onMouseDown":
        case "onMouseDownCapture":
        case "onMouseMove":
        case "onMouseMoveCapture":
        case "onMouseUp":
        case "onMouseUpCapture":
        case "onMouseEnter":
          (d = !d.disabled) || (a = a.type, d = !("button" === a || "input" === a || "select" === a || "textarea" === a));
          a = !d;
          break a;
        default:
          a = false;
      }
      if (a) return null;
      if (c && "function" !== typeof c) throw Error(p(231, b, typeof c));
      return c;
    }
    var Lb = false;
    if (ia) try {
      var Mb = {};
      Object.defineProperty(Mb, "passive", { get: function() {
        Lb = true;
      } });
      window.addEventListener("test", Mb, Mb);
      window.removeEventListener("test", Mb, Mb);
    } catch (a) {
      Lb = false;
    }
    function Nb(a, b, c, d, e, f, g, h, k) {
      var l = Array.prototype.slice.call(arguments, 3);
      try {
        b.apply(c, l);
      } catch (m) {
        this.onError(m);
      }
    }
    var Ob = false, Pb = null, Qb = false, Rb = null, Sb = { onError: function(a) {
      Ob = true;
      Pb = a;
    } };
    function Tb(a, b, c, d, e, f, g, h, k) {
      Ob = false;
      Pb = null;
      Nb.apply(Sb, arguments);
    }
    function Ub(a, b, c, d, e, f, g, h, k) {
      Tb.apply(this, arguments);
      if (Ob) {
        if (Ob) {
          var l = Pb;
          Ob = false;
          Pb = null;
        } else throw Error(p(198));
        Qb || (Qb = true, Rb = l);
      }
    }
    function Vb(a) {
      var b = a, c = a;
      if (a.alternate) for (; b.return; ) b = b.return;
      else {
        a = b;
        do
          b = a, 0 !== (b.flags & 4098) && (c = b.return), a = b.return;
        while (a);
      }
      return 3 === b.tag ? c : null;
    }
    function Wb(a) {
      if (13 === a.tag) {
        var b = a.memoizedState;
        null === b && (a = a.alternate, null !== a && (b = a.memoizedState));
        if (null !== b) return b.dehydrated;
      }
      return null;
    }
    function Xb(a) {
      if (Vb(a) !== a) throw Error(p(188));
    }
    function Yb(a) {
      var b = a.alternate;
      if (!b) {
        b = Vb(a);
        if (null === b) throw Error(p(188));
        return b !== a ? null : a;
      }
      for (var c = a, d = b; ; ) {
        var e = c.return;
        if (null === e) break;
        var f = e.alternate;
        if (null === f) {
          d = e.return;
          if (null !== d) {
            c = d;
            continue;
          }
          break;
        }
        if (e.child === f.child) {
          for (f = e.child; f; ) {
            if (f === c) return Xb(e), a;
            if (f === d) return Xb(e), b;
            f = f.sibling;
          }
          throw Error(p(188));
        }
        if (c.return !== d.return) c = e, d = f;
        else {
          for (var g = false, h = e.child; h; ) {
            if (h === c) {
              g = true;
              c = e;
              d = f;
              break;
            }
            if (h === d) {
              g = true;
              d = e;
              c = f;
              break;
            }
            h = h.sibling;
          }
          if (!g) {
            for (h = f.child; h; ) {
              if (h === c) {
                g = true;
                c = f;
                d = e;
                break;
              }
              if (h === d) {
                g = true;
                d = f;
                c = e;
                break;
              }
              h = h.sibling;
            }
            if (!g) throw Error(p(189));
          }
        }
        if (c.alternate !== d) throw Error(p(190));
      }
      if (3 !== c.tag) throw Error(p(188));
      return c.stateNode.current === c ? a : b;
    }
    function Zb(a) {
      a = Yb(a);
      return null !== a ? $b(a) : null;
    }
    function $b(a) {
      if (5 === a.tag || 6 === a.tag) return a;
      for (a = a.child; null !== a; ) {
        var b = $b(a);
        if (null !== b) return b;
        a = a.sibling;
      }
      return null;
    }
    var ac = ca.unstable_scheduleCallback, bc = ca.unstable_cancelCallback, cc = ca.unstable_shouldYield, dc = ca.unstable_requestPaint, B = ca.unstable_now, ec = ca.unstable_getCurrentPriorityLevel, fc = ca.unstable_ImmediatePriority, gc = ca.unstable_UserBlockingPriority, hc = ca.unstable_NormalPriority, ic = ca.unstable_LowPriority, jc = ca.unstable_IdlePriority, kc = null, lc = null;
    function mc(a) {
      if (lc && "function" === typeof lc.onCommitFiberRoot) try {
        lc.onCommitFiberRoot(kc, a, void 0, 128 === (a.current.flags & 128));
      } catch (b) {
      }
    }
    var oc = Math.clz32 ? Math.clz32 : nc, pc = Math.log, qc = Math.LN2;
    function nc(a) {
      a >>>= 0;
      return 0 === a ? 32 : 31 - (pc(a) / qc | 0) | 0;
    }
    var rc = 64, sc = 4194304;
    function tc(a) {
      switch (a & -a) {
        case 1:
          return 1;
        case 2:
          return 2;
        case 4:
          return 4;
        case 8:
          return 8;
        case 16:
          return 16;
        case 32:
          return 32;
        case 64:
        case 128:
        case 256:
        case 512:
        case 1024:
        case 2048:
        case 4096:
        case 8192:
        case 16384:
        case 32768:
        case 65536:
        case 131072:
        case 262144:
        case 524288:
        case 1048576:
        case 2097152:
          return a & 4194240;
        case 4194304:
        case 8388608:
        case 16777216:
        case 33554432:
        case 67108864:
          return a & 130023424;
        case 134217728:
          return 134217728;
        case 268435456:
          return 268435456;
        case 536870912:
          return 536870912;
        case 1073741824:
          return 1073741824;
        default:
          return a;
      }
    }
    function uc(a, b) {
      var c = a.pendingLanes;
      if (0 === c) return 0;
      var d = 0, e = a.suspendedLanes, f = a.pingedLanes, g = c & 268435455;
      if (0 !== g) {
        var h = g & ~e;
        0 !== h ? d = tc(h) : (f &= g, 0 !== f && (d = tc(f)));
      } else g = c & ~e, 0 !== g ? d = tc(g) : 0 !== f && (d = tc(f));
      if (0 === d) return 0;
      if (0 !== b && b !== d && 0 === (b & e) && (e = d & -d, f = b & -b, e >= f || 16 === e && 0 !== (f & 4194240))) return b;
      0 !== (d & 4) && (d |= c & 16);
      b = a.entangledLanes;
      if (0 !== b) for (a = a.entanglements, b &= d; 0 < b; ) c = 31 - oc(b), e = 1 << c, d |= a[c], b &= ~e;
      return d;
    }
    function vc(a, b) {
      switch (a) {
        case 1:
        case 2:
        case 4:
          return b + 250;
        case 8:
        case 16:
        case 32:
        case 64:
        case 128:
        case 256:
        case 512:
        case 1024:
        case 2048:
        case 4096:
        case 8192:
        case 16384:
        case 32768:
        case 65536:
        case 131072:
        case 262144:
        case 524288:
        case 1048576:
        case 2097152:
          return b + 5e3;
        case 4194304:
        case 8388608:
        case 16777216:
        case 33554432:
        case 67108864:
          return -1;
        case 134217728:
        case 268435456:
        case 536870912:
        case 1073741824:
          return -1;
        default:
          return -1;
      }
    }
    function wc(a, b) {
      for (var c = a.suspendedLanes, d = a.pingedLanes, e = a.expirationTimes, f = a.pendingLanes; 0 < f; ) {
        var g = 31 - oc(f), h = 1 << g, k = e[g];
        if (-1 === k) {
          if (0 === (h & c) || 0 !== (h & d)) e[g] = vc(h, b);
        } else k <= b && (a.expiredLanes |= h);
        f &= ~h;
      }
    }
    function xc(a) {
      a = a.pendingLanes & -1073741825;
      return 0 !== a ? a : a & 1073741824 ? 1073741824 : 0;
    }
    function yc() {
      var a = rc;
      rc <<= 1;
      0 === (rc & 4194240) && (rc = 64);
      return a;
    }
    function zc(a) {
      for (var b = [], c = 0; 31 > c; c++) b.push(a);
      return b;
    }
    function Ac(a, b, c) {
      a.pendingLanes |= b;
      536870912 !== b && (a.suspendedLanes = 0, a.pingedLanes = 0);
      a = a.eventTimes;
      b = 31 - oc(b);
      a[b] = c;
    }
    function Bc(a, b) {
      var c = a.pendingLanes & ~b;
      a.pendingLanes = b;
      a.suspendedLanes = 0;
      a.pingedLanes = 0;
      a.expiredLanes &= b;
      a.mutableReadLanes &= b;
      a.entangledLanes &= b;
      b = a.entanglements;
      var d = a.eventTimes;
      for (a = a.expirationTimes; 0 < c; ) {
        var e = 31 - oc(c), f = 1 << e;
        b[e] = 0;
        d[e] = -1;
        a[e] = -1;
        c &= ~f;
      }
    }
    function Cc(a, b) {
      var c = a.entangledLanes |= b;
      for (a = a.entanglements; c; ) {
        var d = 31 - oc(c), e = 1 << d;
        e & b | a[d] & b && (a[d] |= b);
        c &= ~e;
      }
    }
    var C = 0;
    function Dc(a) {
      a &= -a;
      return 1 < a ? 4 < a ? 0 !== (a & 268435455) ? 16 : 536870912 : 4 : 1;
    }
    var Ec, Fc, Gc, Hc, Ic, Jc = false, Kc = [], Lc = null, Mc = null, Nc = null, Oc = /* @__PURE__ */ new Map(), Pc = /* @__PURE__ */ new Map(), Qc = [], Rc = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");
    function Sc(a, b) {
      switch (a) {
        case "focusin":
        case "focusout":
          Lc = null;
          break;
        case "dragenter":
        case "dragleave":
          Mc = null;
          break;
        case "mouseover":
        case "mouseout":
          Nc = null;
          break;
        case "pointerover":
        case "pointerout":
          Oc.delete(b.pointerId);
          break;
        case "gotpointercapture":
        case "lostpointercapture":
          Pc.delete(b.pointerId);
      }
    }
    function Tc(a, b, c, d, e, f) {
      if (null === a || a.nativeEvent !== f) return a = { blockedOn: b, domEventName: c, eventSystemFlags: d, nativeEvent: f, targetContainers: [e] }, null !== b && (b = Cb(b), null !== b && Fc(b)), a;
      a.eventSystemFlags |= d;
      b = a.targetContainers;
      null !== e && -1 === b.indexOf(e) && b.push(e);
      return a;
    }
    function Uc(a, b, c, d, e) {
      switch (b) {
        case "focusin":
          return Lc = Tc(Lc, a, b, c, d, e), true;
        case "dragenter":
          return Mc = Tc(Mc, a, b, c, d, e), true;
        case "mouseover":
          return Nc = Tc(Nc, a, b, c, d, e), true;
        case "pointerover":
          var f = e.pointerId;
          Oc.set(f, Tc(Oc.get(f) || null, a, b, c, d, e));
          return true;
        case "gotpointercapture":
          return f = e.pointerId, Pc.set(f, Tc(Pc.get(f) || null, a, b, c, d, e)), true;
      }
      return false;
    }
    function Vc(a) {
      var b = Wc(a.target);
      if (null !== b) {
        var c = Vb(b);
        if (null !== c) {
          if (b = c.tag, 13 === b) {
            if (b = Wb(c), null !== b) {
              a.blockedOn = b;
              Ic(a.priority, function() {
                Gc(c);
              });
              return;
            }
          } else if (3 === b && c.stateNode.current.memoizedState.isDehydrated) {
            a.blockedOn = 3 === c.tag ? c.stateNode.containerInfo : null;
            return;
          }
        }
      }
      a.blockedOn = null;
    }
    function Xc(a) {
      if (null !== a.blockedOn) return false;
      for (var b = a.targetContainers; 0 < b.length; ) {
        var c = Yc(a.domEventName, a.eventSystemFlags, b[0], a.nativeEvent);
        if (null === c) {
          c = a.nativeEvent;
          var d = new c.constructor(c.type, c);
          wb = d;
          c.target.dispatchEvent(d);
          wb = null;
        } else return b = Cb(c), null !== b && Fc(b), a.blockedOn = c, false;
        b.shift();
      }
      return true;
    }
    function Zc(a, b, c) {
      Xc(a) && c.delete(b);
    }
    function $c() {
      Jc = false;
      null !== Lc && Xc(Lc) && (Lc = null);
      null !== Mc && Xc(Mc) && (Mc = null);
      null !== Nc && Xc(Nc) && (Nc = null);
      Oc.forEach(Zc);
      Pc.forEach(Zc);
    }
    function ad(a, b) {
      a.blockedOn === b && (a.blockedOn = null, Jc || (Jc = true, ca.unstable_scheduleCallback(ca.unstable_NormalPriority, $c)));
    }
    function bd(a) {
      function b(b2) {
        return ad(b2, a);
      }
      if (0 < Kc.length) {
        ad(Kc[0], a);
        for (var c = 1; c < Kc.length; c++) {
          var d = Kc[c];
          d.blockedOn === a && (d.blockedOn = null);
        }
      }
      null !== Lc && ad(Lc, a);
      null !== Mc && ad(Mc, a);
      null !== Nc && ad(Nc, a);
      Oc.forEach(b);
      Pc.forEach(b);
      for (c = 0; c < Qc.length; c++) d = Qc[c], d.blockedOn === a && (d.blockedOn = null);
      for (; 0 < Qc.length && (c = Qc[0], null === c.blockedOn); ) Vc(c), null === c.blockedOn && Qc.shift();
    }
    var cd = ua.ReactCurrentBatchConfig, dd = true;
    function ed(a, b, c, d) {
      var e = C, f = cd.transition;
      cd.transition = null;
      try {
        C = 1, fd(a, b, c, d);
      } finally {
        C = e, cd.transition = f;
      }
    }
    function gd(a, b, c, d) {
      var e = C, f = cd.transition;
      cd.transition = null;
      try {
        C = 4, fd(a, b, c, d);
      } finally {
        C = e, cd.transition = f;
      }
    }
    function fd(a, b, c, d) {
      if (dd) {
        var e = Yc(a, b, c, d);
        if (null === e) hd(a, b, d, id, c), Sc(a, d);
        else if (Uc(e, a, b, c, d)) d.stopPropagation();
        else if (Sc(a, d), b & 4 && -1 < Rc.indexOf(a)) {
          for (; null !== e; ) {
            var f = Cb(e);
            null !== f && Ec(f);
            f = Yc(a, b, c, d);
            null === f && hd(a, b, d, id, c);
            if (f === e) break;
            e = f;
          }
          null !== e && d.stopPropagation();
        } else hd(a, b, d, null, c);
      }
    }
    var id = null;
    function Yc(a, b, c, d) {
      id = null;
      a = xb(d);
      a = Wc(a);
      if (null !== a) if (b = Vb(a), null === b) a = null;
      else if (c = b.tag, 13 === c) {
        a = Wb(b);
        if (null !== a) return a;
        a = null;
      } else if (3 === c) {
        if (b.stateNode.current.memoizedState.isDehydrated) return 3 === b.tag ? b.stateNode.containerInfo : null;
        a = null;
      } else b !== a && (a = null);
      id = a;
      return null;
    }
    function jd(a) {
      switch (a) {
        case "cancel":
        case "click":
        case "close":
        case "contextmenu":
        case "copy":
        case "cut":
        case "auxclick":
        case "dblclick":
        case "dragend":
        case "dragstart":
        case "drop":
        case "focusin":
        case "focusout":
        case "input":
        case "invalid":
        case "keydown":
        case "keypress":
        case "keyup":
        case "mousedown":
        case "mouseup":
        case "paste":
        case "pause":
        case "play":
        case "pointercancel":
        case "pointerdown":
        case "pointerup":
        case "ratechange":
        case "reset":
        case "resize":
        case "seeked":
        case "submit":
        case "touchcancel":
        case "touchend":
        case "touchstart":
        case "volumechange":
        case "change":
        case "selectionchange":
        case "textInput":
        case "compositionstart":
        case "compositionend":
        case "compositionupdate":
        case "beforeblur":
        case "afterblur":
        case "beforeinput":
        case "blur":
        case "fullscreenchange":
        case "focus":
        case "hashchange":
        case "popstate":
        case "select":
        case "selectstart":
          return 1;
        case "drag":
        case "dragenter":
        case "dragexit":
        case "dragleave":
        case "dragover":
        case "mousemove":
        case "mouseout":
        case "mouseover":
        case "pointermove":
        case "pointerout":
        case "pointerover":
        case "scroll":
        case "toggle":
        case "touchmove":
        case "wheel":
        case "mouseenter":
        case "mouseleave":
        case "pointerenter":
        case "pointerleave":
          return 4;
        case "message":
          switch (ec()) {
            case fc:
              return 1;
            case gc:
              return 4;
            case hc:
            case ic:
              return 16;
            case jc:
              return 536870912;
            default:
              return 16;
          }
        default:
          return 16;
      }
    }
    var kd = null, ld = null, md = null;
    function nd() {
      if (md) return md;
      var a, b = ld, c = b.length, d, e = "value" in kd ? kd.value : kd.textContent, f = e.length;
      for (a = 0; a < c && b[a] === e[a]; a++) ;
      var g = c - a;
      for (d = 1; d <= g && b[c - d] === e[f - d]; d++) ;
      return md = e.slice(a, 1 < d ? 1 - d : void 0);
    }
    function od(a) {
      var b = a.keyCode;
      "charCode" in a ? (a = a.charCode, 0 === a && 13 === b && (a = 13)) : a = b;
      10 === a && (a = 13);
      return 32 <= a || 13 === a ? a : 0;
    }
    function pd() {
      return true;
    }
    function qd() {
      return false;
    }
    function rd(a) {
      function b(b2, d, e, f, g) {
        this._reactName = b2;
        this._targetInst = e;
        this.type = d;
        this.nativeEvent = f;
        this.target = g;
        this.currentTarget = null;
        for (var c in a) a.hasOwnProperty(c) && (b2 = a[c], this[c] = b2 ? b2(f) : f[c]);
        this.isDefaultPrevented = (null != f.defaultPrevented ? f.defaultPrevented : false === f.returnValue) ? pd : qd;
        this.isPropagationStopped = qd;
        return this;
      }
      A(b.prototype, { preventDefault: function() {
        this.defaultPrevented = true;
        var a2 = this.nativeEvent;
        a2 && (a2.preventDefault ? a2.preventDefault() : "unknown" !== typeof a2.returnValue && (a2.returnValue = false), this.isDefaultPrevented = pd);
      }, stopPropagation: function() {
        var a2 = this.nativeEvent;
        a2 && (a2.stopPropagation ? a2.stopPropagation() : "unknown" !== typeof a2.cancelBubble && (a2.cancelBubble = true), this.isPropagationStopped = pd);
      }, persist: function() {
      }, isPersistent: pd });
      return b;
    }
    var sd = { eventPhase: 0, bubbles: 0, cancelable: 0, timeStamp: function(a) {
      return a.timeStamp || Date.now();
    }, defaultPrevented: 0, isTrusted: 0 }, td = rd(sd), ud = A({}, sd, { view: 0, detail: 0 }), vd = rd(ud), wd, xd, yd, Ad = A({}, ud, { screenX: 0, screenY: 0, clientX: 0, clientY: 0, pageX: 0, pageY: 0, ctrlKey: 0, shiftKey: 0, altKey: 0, metaKey: 0, getModifierState: zd, button: 0, buttons: 0, relatedTarget: function(a) {
      return void 0 === a.relatedTarget ? a.fromElement === a.srcElement ? a.toElement : a.fromElement : a.relatedTarget;
    }, movementX: function(a) {
      if ("movementX" in a) return a.movementX;
      a !== yd && (yd && "mousemove" === a.type ? (wd = a.screenX - yd.screenX, xd = a.screenY - yd.screenY) : xd = wd = 0, yd = a);
      return wd;
    }, movementY: function(a) {
      return "movementY" in a ? a.movementY : xd;
    } }), Bd = rd(Ad), Cd = A({}, Ad, { dataTransfer: 0 }), Dd = rd(Cd), Ed = A({}, ud, { relatedTarget: 0 }), Fd = rd(Ed), Gd = A({}, sd, { animationName: 0, elapsedTime: 0, pseudoElement: 0 }), Hd = rd(Gd), Id = A({}, sd, { clipboardData: function(a) {
      return "clipboardData" in a ? a.clipboardData : window.clipboardData;
    } }), Jd = rd(Id), Kd = A({}, sd, { data: 0 }), Ld = rd(Kd), Md = {
      Esc: "Escape",
      Spacebar: " ",
      Left: "ArrowLeft",
      Up: "ArrowUp",
      Right: "ArrowRight",
      Down: "ArrowDown",
      Del: "Delete",
      Win: "OS",
      Menu: "ContextMenu",
      Apps: "ContextMenu",
      Scroll: "ScrollLock",
      MozPrintableKey: "Unidentified"
    }, Nd = {
      8: "Backspace",
      9: "Tab",
      12: "Clear",
      13: "Enter",
      16: "Shift",
      17: "Control",
      18: "Alt",
      19: "Pause",
      20: "CapsLock",
      27: "Escape",
      32: " ",
      33: "PageUp",
      34: "PageDown",
      35: "End",
      36: "Home",
      37: "ArrowLeft",
      38: "ArrowUp",
      39: "ArrowRight",
      40: "ArrowDown",
      45: "Insert",
      46: "Delete",
      112: "F1",
      113: "F2",
      114: "F3",
      115: "F4",
      116: "F5",
      117: "F6",
      118: "F7",
      119: "F8",
      120: "F9",
      121: "F10",
      122: "F11",
      123: "F12",
      144: "NumLock",
      145: "ScrollLock",
      224: "Meta"
    }, Od = { Alt: "altKey", Control: "ctrlKey", Meta: "metaKey", Shift: "shiftKey" };
    function Pd(a) {
      var b = this.nativeEvent;
      return b.getModifierState ? b.getModifierState(a) : (a = Od[a]) ? !!b[a] : false;
    }
    function zd() {
      return Pd;
    }
    var Qd = A({}, ud, { key: function(a) {
      if (a.key) {
        var b = Md[a.key] || a.key;
        if ("Unidentified" !== b) return b;
      }
      return "keypress" === a.type ? (a = od(a), 13 === a ? "Enter" : String.fromCharCode(a)) : "keydown" === a.type || "keyup" === a.type ? Nd[a.keyCode] || "Unidentified" : "";
    }, code: 0, location: 0, ctrlKey: 0, shiftKey: 0, altKey: 0, metaKey: 0, repeat: 0, locale: 0, getModifierState: zd, charCode: function(a) {
      return "keypress" === a.type ? od(a) : 0;
    }, keyCode: function(a) {
      return "keydown" === a.type || "keyup" === a.type ? a.keyCode : 0;
    }, which: function(a) {
      return "keypress" === a.type ? od(a) : "keydown" === a.type || "keyup" === a.type ? a.keyCode : 0;
    } }), Rd = rd(Qd), Sd = A({}, Ad, { pointerId: 0, width: 0, height: 0, pressure: 0, tangentialPressure: 0, tiltX: 0, tiltY: 0, twist: 0, pointerType: 0, isPrimary: 0 }), Td = rd(Sd), Ud = A({}, ud, { touches: 0, targetTouches: 0, changedTouches: 0, altKey: 0, metaKey: 0, ctrlKey: 0, shiftKey: 0, getModifierState: zd }), Vd = rd(Ud), Wd = A({}, sd, { propertyName: 0, elapsedTime: 0, pseudoElement: 0 }), Xd = rd(Wd), Yd = A({}, Ad, {
      deltaX: function(a) {
        return "deltaX" in a ? a.deltaX : "wheelDeltaX" in a ? -a.wheelDeltaX : 0;
      },
      deltaY: function(a) {
        return "deltaY" in a ? a.deltaY : "wheelDeltaY" in a ? -a.wheelDeltaY : "wheelDelta" in a ? -a.wheelDelta : 0;
      },
      deltaZ: 0,
      deltaMode: 0
    }), Zd = rd(Yd), $d = [9, 13, 27, 32], ae = ia && "CompositionEvent" in window, be = null;
    ia && "documentMode" in document && (be = document.documentMode);
    var ce = ia && "TextEvent" in window && !be, de = ia && (!ae || be && 8 < be && 11 >= be), ee = String.fromCharCode(32), fe = false;
    function ge(a, b) {
      switch (a) {
        case "keyup":
          return -1 !== $d.indexOf(b.keyCode);
        case "keydown":
          return 229 !== b.keyCode;
        case "keypress":
        case "mousedown":
        case "focusout":
          return true;
        default:
          return false;
      }
    }
    function he(a) {
      a = a.detail;
      return "object" === typeof a && "data" in a ? a.data : null;
    }
    var ie = false;
    function je(a, b) {
      switch (a) {
        case "compositionend":
          return he(b);
        case "keypress":
          if (32 !== b.which) return null;
          fe = true;
          return ee;
        case "textInput":
          return a = b.data, a === ee && fe ? null : a;
        default:
          return null;
      }
    }
    function ke(a, b) {
      if (ie) return "compositionend" === a || !ae && ge(a, b) ? (a = nd(), md = ld = kd = null, ie = false, a) : null;
      switch (a) {
        case "paste":
          return null;
        case "keypress":
          if (!(b.ctrlKey || b.altKey || b.metaKey) || b.ctrlKey && b.altKey) {
            if (b.char && 1 < b.char.length) return b.char;
            if (b.which) return String.fromCharCode(b.which);
          }
          return null;
        case "compositionend":
          return de && "ko" !== b.locale ? null : b.data;
        default:
          return null;
      }
    }
    var le = { color: true, date: true, datetime: true, "datetime-local": true, email: true, month: true, number: true, password: true, range: true, search: true, tel: true, text: true, time: true, url: true, week: true };
    function me(a) {
      var b = a && a.nodeName && a.nodeName.toLowerCase();
      return "input" === b ? !!le[a.type] : "textarea" === b ? true : false;
    }
    function ne(a, b, c, d) {
      Eb(d);
      b = oe(b, "onChange");
      0 < b.length && (c = new td("onChange", "change", null, c, d), a.push({ event: c, listeners: b }));
    }
    var pe = null, qe = null;
    function re(a) {
      se(a, 0);
    }
    function te(a) {
      var b = ue(a);
      if (Wa(b)) return a;
    }
    function ve(a, b) {
      if ("change" === a) return b;
    }
    var we = false;
    if (ia) {
      var xe;
      if (ia) {
        var ye = "oninput" in document;
        if (!ye) {
          var ze = document.createElement("div");
          ze.setAttribute("oninput", "return;");
          ye = "function" === typeof ze.oninput;
        }
        xe = ye;
      } else xe = false;
      we = xe && (!document.documentMode || 9 < document.documentMode);
    }
    function Ae() {
      pe && (pe.detachEvent("onpropertychange", Be), qe = pe = null);
    }
    function Be(a) {
      if ("value" === a.propertyName && te(qe)) {
        var b = [];
        ne(b, qe, a, xb(a));
        Jb(re, b);
      }
    }
    function Ce(a, b, c) {
      "focusin" === a ? (Ae(), pe = b, qe = c, pe.attachEvent("onpropertychange", Be)) : "focusout" === a && Ae();
    }
    function De(a) {
      if ("selectionchange" === a || "keyup" === a || "keydown" === a) return te(qe);
    }
    function Ee(a, b) {
      if ("click" === a) return te(b);
    }
    function Fe(a, b) {
      if ("input" === a || "change" === a) return te(b);
    }
    function Ge(a, b) {
      return a === b && (0 !== a || 1 / a === 1 / b) || a !== a && b !== b;
    }
    var He = "function" === typeof Object.is ? Object.is : Ge;
    function Ie(a, b) {
      if (He(a, b)) return true;
      if ("object" !== typeof a || null === a || "object" !== typeof b || null === b) return false;
      var c = Object.keys(a), d = Object.keys(b);
      if (c.length !== d.length) return false;
      for (d = 0; d < c.length; d++) {
        var e = c[d];
        if (!ja.call(b, e) || !He(a[e], b[e])) return false;
      }
      return true;
    }
    function Je(a) {
      for (; a && a.firstChild; ) a = a.firstChild;
      return a;
    }
    function Ke(a, b) {
      var c = Je(a);
      a = 0;
      for (var d; c; ) {
        if (3 === c.nodeType) {
          d = a + c.textContent.length;
          if (a <= b && d >= b) return { node: c, offset: b - a };
          a = d;
        }
        a: {
          for (; c; ) {
            if (c.nextSibling) {
              c = c.nextSibling;
              break a;
            }
            c = c.parentNode;
          }
          c = void 0;
        }
        c = Je(c);
      }
    }
    function Le(a, b) {
      return a && b ? a === b ? true : a && 3 === a.nodeType ? false : b && 3 === b.nodeType ? Le(a, b.parentNode) : "contains" in a ? a.contains(b) : a.compareDocumentPosition ? !!(a.compareDocumentPosition(b) & 16) : false : false;
    }
    function Me() {
      for (var a = window, b = Xa(); b instanceof a.HTMLIFrameElement; ) {
        try {
          var c = "string" === typeof b.contentWindow.location.href;
        } catch (d) {
          c = false;
        }
        if (c) a = b.contentWindow;
        else break;
        b = Xa(a.document);
      }
      return b;
    }
    function Ne(a) {
      var b = a && a.nodeName && a.nodeName.toLowerCase();
      return b && ("input" === b && ("text" === a.type || "search" === a.type || "tel" === a.type || "url" === a.type || "password" === a.type) || "textarea" === b || "true" === a.contentEditable);
    }
    function Oe(a) {
      var b = Me(), c = a.focusedElem, d = a.selectionRange;
      if (b !== c && c && c.ownerDocument && Le(c.ownerDocument.documentElement, c)) {
        if (null !== d && Ne(c)) {
          if (b = d.start, a = d.end, void 0 === a && (a = b), "selectionStart" in c) c.selectionStart = b, c.selectionEnd = Math.min(a, c.value.length);
          else if (a = (b = c.ownerDocument || document) && b.defaultView || window, a.getSelection) {
            a = a.getSelection();
            var e = c.textContent.length, f = Math.min(d.start, e);
            d = void 0 === d.end ? f : Math.min(d.end, e);
            !a.extend && f > d && (e = d, d = f, f = e);
            e = Ke(c, f);
            var g = Ke(
              c,
              d
            );
            e && g && (1 !== a.rangeCount || a.anchorNode !== e.node || a.anchorOffset !== e.offset || a.focusNode !== g.node || a.focusOffset !== g.offset) && (b = b.createRange(), b.setStart(e.node, e.offset), a.removeAllRanges(), f > d ? (a.addRange(b), a.extend(g.node, g.offset)) : (b.setEnd(g.node, g.offset), a.addRange(b)));
          }
        }
        b = [];
        for (a = c; a = a.parentNode; ) 1 === a.nodeType && b.push({ element: a, left: a.scrollLeft, top: a.scrollTop });
        "function" === typeof c.focus && c.focus();
        for (c = 0; c < b.length; c++) a = b[c], a.element.scrollLeft = a.left, a.element.scrollTop = a.top;
      }
    }
    var Pe = ia && "documentMode" in document && 11 >= document.documentMode, Qe = null, Re = null, Se = null, Te = false;
    function Ue(a, b, c) {
      var d = c.window === c ? c.document : 9 === c.nodeType ? c : c.ownerDocument;
      Te || null == Qe || Qe !== Xa(d) || (d = Qe, "selectionStart" in d && Ne(d) ? d = { start: d.selectionStart, end: d.selectionEnd } : (d = (d.ownerDocument && d.ownerDocument.defaultView || window).getSelection(), d = { anchorNode: d.anchorNode, anchorOffset: d.anchorOffset, focusNode: d.focusNode, focusOffset: d.focusOffset }), Se && Ie(Se, d) || (Se = d, d = oe(Re, "onSelect"), 0 < d.length && (b = new td("onSelect", "select", null, b, c), a.push({ event: b, listeners: d }), b.target = Qe)));
    }
    function Ve(a, b) {
      var c = {};
      c[a.toLowerCase()] = b.toLowerCase();
      c["Webkit" + a] = "webkit" + b;
      c["Moz" + a] = "moz" + b;
      return c;
    }
    var We = { animationend: Ve("Animation", "AnimationEnd"), animationiteration: Ve("Animation", "AnimationIteration"), animationstart: Ve("Animation", "AnimationStart"), transitionend: Ve("Transition", "TransitionEnd") }, Xe = {}, Ye = {};
    ia && (Ye = document.createElement("div").style, "AnimationEvent" in window || (delete We.animationend.animation, delete We.animationiteration.animation, delete We.animationstart.animation), "TransitionEvent" in window || delete We.transitionend.transition);
    function Ze(a) {
      if (Xe[a]) return Xe[a];
      if (!We[a]) return a;
      var b = We[a], c;
      for (c in b) if (b.hasOwnProperty(c) && c in Ye) return Xe[a] = b[c];
      return a;
    }
    var $e = Ze("animationend"), af = Ze("animationiteration"), bf = Ze("animationstart"), cf = Ze("transitionend"), df = /* @__PURE__ */ new Map(), ef = "abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");
    function ff(a, b) {
      df.set(a, b);
      fa(b, [a]);
    }
    for (var gf = 0; gf < ef.length; gf++) {
      var hf = ef[gf], jf = hf.toLowerCase(), kf = hf[0].toUpperCase() + hf.slice(1);
      ff(jf, "on" + kf);
    }
    ff($e, "onAnimationEnd");
    ff(af, "onAnimationIteration");
    ff(bf, "onAnimationStart");
    ff("dblclick", "onDoubleClick");
    ff("focusin", "onFocus");
    ff("focusout", "onBlur");
    ff(cf, "onTransitionEnd");
    ha("onMouseEnter", ["mouseout", "mouseover"]);
    ha("onMouseLeave", ["mouseout", "mouseover"]);
    ha("onPointerEnter", ["pointerout", "pointerover"]);
    ha("onPointerLeave", ["pointerout", "pointerover"]);
    fa("onChange", "change click focusin focusout input keydown keyup selectionchange".split(" "));
    fa("onSelect", "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));
    fa("onBeforeInput", ["compositionend", "keypress", "textInput", "paste"]);
    fa("onCompositionEnd", "compositionend focusout keydown keypress keyup mousedown".split(" "));
    fa("onCompositionStart", "compositionstart focusout keydown keypress keyup mousedown".split(" "));
    fa("onCompositionUpdate", "compositionupdate focusout keydown keypress keyup mousedown".split(" "));
    var lf = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "), mf = new Set("cancel close invalid load scroll toggle".split(" ").concat(lf));
    function nf(a, b, c) {
      var d = a.type || "unknown-event";
      a.currentTarget = c;
      Ub(d, b, void 0, a);
      a.currentTarget = null;
    }
    function se(a, b) {
      b = 0 !== (b & 4);
      for (var c = 0; c < a.length; c++) {
        var d = a[c], e = d.event;
        d = d.listeners;
        a: {
          var f = void 0;
          if (b) for (var g = d.length - 1; 0 <= g; g--) {
            var h = d[g], k = h.instance, l = h.currentTarget;
            h = h.listener;
            if (k !== f && e.isPropagationStopped()) break a;
            nf(e, h, l);
            f = k;
          }
          else for (g = 0; g < d.length; g++) {
            h = d[g];
            k = h.instance;
            l = h.currentTarget;
            h = h.listener;
            if (k !== f && e.isPropagationStopped()) break a;
            nf(e, h, l);
            f = k;
          }
        }
      }
      if (Qb) throw a = Rb, Qb = false, Rb = null, a;
    }
    function D(a, b) {
      var c = b[of];
      void 0 === c && (c = b[of] = /* @__PURE__ */ new Set());
      var d = a + "__bubble";
      c.has(d) || (pf(b, a, 2, false), c.add(d));
    }
    function qf(a, b, c) {
      var d = 0;
      b && (d |= 4);
      pf(c, a, d, b);
    }
    var rf = "_reactListening" + Math.random().toString(36).slice(2);
    function sf(a) {
      if (!a[rf]) {
        a[rf] = true;
        da.forEach(function(b2) {
          "selectionchange" !== b2 && (mf.has(b2) || qf(b2, false, a), qf(b2, true, a));
        });
        var b = 9 === a.nodeType ? a : a.ownerDocument;
        null === b || b[rf] || (b[rf] = true, qf("selectionchange", false, b));
      }
    }
    function pf(a, b, c, d) {
      switch (jd(b)) {
        case 1:
          var e = ed;
          break;
        case 4:
          e = gd;
          break;
        default:
          e = fd;
      }
      c = e.bind(null, b, c, a);
      e = void 0;
      !Lb || "touchstart" !== b && "touchmove" !== b && "wheel" !== b || (e = true);
      d ? void 0 !== e ? a.addEventListener(b, c, { capture: true, passive: e }) : a.addEventListener(b, c, true) : void 0 !== e ? a.addEventListener(b, c, { passive: e }) : a.addEventListener(b, c, false);
    }
    function hd(a, b, c, d, e) {
      var f = d;
      if (0 === (b & 1) && 0 === (b & 2) && null !== d) a: for (; ; ) {
        if (null === d) return;
        var g = d.tag;
        if (3 === g || 4 === g) {
          var h = d.stateNode.containerInfo;
          if (h === e || 8 === h.nodeType && h.parentNode === e) break;
          if (4 === g) for (g = d.return; null !== g; ) {
            var k = g.tag;
            if (3 === k || 4 === k) {
              if (k = g.stateNode.containerInfo, k === e || 8 === k.nodeType && k.parentNode === e) return;
            }
            g = g.return;
          }
          for (; null !== h; ) {
            g = Wc(h);
            if (null === g) return;
            k = g.tag;
            if (5 === k || 6 === k) {
              d = f = g;
              continue a;
            }
            h = h.parentNode;
          }
        }
        d = d.return;
      }
      Jb(function() {
        var d2 = f, e2 = xb(c), g2 = [];
        a: {
          var h2 = df.get(a);
          if (void 0 !== h2) {
            var k2 = td, n = a;
            switch (a) {
              case "keypress":
                if (0 === od(c)) break a;
              case "keydown":
              case "keyup":
                k2 = Rd;
                break;
              case "focusin":
                n = "focus";
                k2 = Fd;
                break;
              case "focusout":
                n = "blur";
                k2 = Fd;
                break;
              case "beforeblur":
              case "afterblur":
                k2 = Fd;
                break;
              case "click":
                if (2 === c.button) break a;
              case "auxclick":
              case "dblclick":
              case "mousedown":
              case "mousemove":
              case "mouseup":
              case "mouseout":
              case "mouseover":
              case "contextmenu":
                k2 = Bd;
                break;
              case "drag":
              case "dragend":
              case "dragenter":
              case "dragexit":
              case "dragleave":
              case "dragover":
              case "dragstart":
              case "drop":
                k2 = Dd;
                break;
              case "touchcancel":
              case "touchend":
              case "touchmove":
              case "touchstart":
                k2 = Vd;
                break;
              case $e:
              case af:
              case bf:
                k2 = Hd;
                break;
              case cf:
                k2 = Xd;
                break;
              case "scroll":
                k2 = vd;
                break;
              case "wheel":
                k2 = Zd;
                break;
              case "copy":
              case "cut":
              case "paste":
                k2 = Jd;
                break;
              case "gotpointercapture":
              case "lostpointercapture":
              case "pointercancel":
              case "pointerdown":
              case "pointermove":
              case "pointerout":
              case "pointerover":
              case "pointerup":
                k2 = Td;
            }
            var t = 0 !== (b & 4), J = !t && "scroll" === a, x = t ? null !== h2 ? h2 + "Capture" : null : h2;
            t = [];
            for (var w = d2, u; null !== w; ) {
              u = w;
              var F = u.stateNode;
              5 === u.tag && null !== F && (u = F, null !== x && (F = Kb(w, x), null != F && t.push(tf(w, F, u))));
              if (J) break;
              w = w.return;
            }
            0 < t.length && (h2 = new k2(h2, n, null, c, e2), g2.push({ event: h2, listeners: t }));
          }
        }
        if (0 === (b & 7)) {
          a: {
            h2 = "mouseover" === a || "pointerover" === a;
            k2 = "mouseout" === a || "pointerout" === a;
            if (h2 && c !== wb && (n = c.relatedTarget || c.fromElement) && (Wc(n) || n[uf])) break a;
            if (k2 || h2) {
              h2 = e2.window === e2 ? e2 : (h2 = e2.ownerDocument) ? h2.defaultView || h2.parentWindow : window;
              if (k2) {
                if (n = c.relatedTarget || c.toElement, k2 = d2, n = n ? Wc(n) : null, null !== n && (J = Vb(n), n !== J || 5 !== n.tag && 6 !== n.tag)) n = null;
              } else k2 = null, n = d2;
              if (k2 !== n) {
                t = Bd;
                F = "onMouseLeave";
                x = "onMouseEnter";
                w = "mouse";
                if ("pointerout" === a || "pointerover" === a) t = Td, F = "onPointerLeave", x = "onPointerEnter", w = "pointer";
                J = null == k2 ? h2 : ue(k2);
                u = null == n ? h2 : ue(n);
                h2 = new t(F, w + "leave", k2, c, e2);
                h2.target = J;
                h2.relatedTarget = u;
                F = null;
                Wc(e2) === d2 && (t = new t(x, w + "enter", n, c, e2), t.target = u, t.relatedTarget = J, F = t);
                J = F;
                if (k2 && n) b: {
                  t = k2;
                  x = n;
                  w = 0;
                  for (u = t; u; u = vf(u)) w++;
                  u = 0;
                  for (F = x; F; F = vf(F)) u++;
                  for (; 0 < w - u; ) t = vf(t), w--;
                  for (; 0 < u - w; ) x = vf(x), u--;
                  for (; w--; ) {
                    if (t === x || null !== x && t === x.alternate) break b;
                    t = vf(t);
                    x = vf(x);
                  }
                  t = null;
                }
                else t = null;
                null !== k2 && wf(g2, h2, k2, t, false);
                null !== n && null !== J && wf(g2, J, n, t, true);
              }
            }
          }
          a: {
            h2 = d2 ? ue(d2) : window;
            k2 = h2.nodeName && h2.nodeName.toLowerCase();
            if ("select" === k2 || "input" === k2 && "file" === h2.type) var na = ve;
            else if (me(h2)) if (we) na = Fe;
            else {
              na = De;
              var xa = Ce;
            }
            else (k2 = h2.nodeName) && "input" === k2.toLowerCase() && ("checkbox" === h2.type || "radio" === h2.type) && (na = Ee);
            if (na && (na = na(a, d2))) {
              ne(g2, na, c, e2);
              break a;
            }
            xa && xa(a, h2, d2);
            "focusout" === a && (xa = h2._wrapperState) && xa.controlled && "number" === h2.type && cb(h2, "number", h2.value);
          }
          xa = d2 ? ue(d2) : window;
          switch (a) {
            case "focusin":
              if (me(xa) || "true" === xa.contentEditable) Qe = xa, Re = d2, Se = null;
              break;
            case "focusout":
              Se = Re = Qe = null;
              break;
            case "mousedown":
              Te = true;
              break;
            case "contextmenu":
            case "mouseup":
            case "dragend":
              Te = false;
              Ue(g2, c, e2);
              break;
            case "selectionchange":
              if (Pe) break;
            case "keydown":
            case "keyup":
              Ue(g2, c, e2);
          }
          var $a;
          if (ae) b: {
            switch (a) {
              case "compositionstart":
                var ba = "onCompositionStart";
                break b;
              case "compositionend":
                ba = "onCompositionEnd";
                break b;
              case "compositionupdate":
                ba = "onCompositionUpdate";
                break b;
            }
            ba = void 0;
          }
          else ie ? ge(a, c) && (ba = "onCompositionEnd") : "keydown" === a && 229 === c.keyCode && (ba = "onCompositionStart");
          ba && (de && "ko" !== c.locale && (ie || "onCompositionStart" !== ba ? "onCompositionEnd" === ba && ie && ($a = nd()) : (kd = e2, ld = "value" in kd ? kd.value : kd.textContent, ie = true)), xa = oe(d2, ba), 0 < xa.length && (ba = new Ld(ba, a, null, c, e2), g2.push({ event: ba, listeners: xa }), $a ? ba.data = $a : ($a = he(c), null !== $a && (ba.data = $a))));
          if ($a = ce ? je(a, c) : ke(a, c)) d2 = oe(d2, "onBeforeInput"), 0 < d2.length && (e2 = new Ld("onBeforeInput", "beforeinput", null, c, e2), g2.push({ event: e2, listeners: d2 }), e2.data = $a);
        }
        se(g2, b);
      });
    }
    function tf(a, b, c) {
      return { instance: a, listener: b, currentTarget: c };
    }
    function oe(a, b) {
      for (var c = b + "Capture", d = []; null !== a; ) {
        var e = a, f = e.stateNode;
        5 === e.tag && null !== f && (e = f, f = Kb(a, c), null != f && d.unshift(tf(a, f, e)), f = Kb(a, b), null != f && d.push(tf(a, f, e)));
        a = a.return;
      }
      return d;
    }
    function vf(a) {
      if (null === a) return null;
      do
        a = a.return;
      while (a && 5 !== a.tag);
      return a ? a : null;
    }
    function wf(a, b, c, d, e) {
      for (var f = b._reactName, g = []; null !== c && c !== d; ) {
        var h = c, k = h.alternate, l = h.stateNode;
        if (null !== k && k === d) break;
        5 === h.tag && null !== l && (h = l, e ? (k = Kb(c, f), null != k && g.unshift(tf(c, k, h))) : e || (k = Kb(c, f), null != k && g.push(tf(c, k, h))));
        c = c.return;
      }
      0 !== g.length && a.push({ event: b, listeners: g });
    }
    var xf = /\r\n?/g, yf = /\u0000|\uFFFD/g;
    function zf(a) {
      return ("string" === typeof a ? a : "" + a).replace(xf, "\n").replace(yf, "");
    }
    function Af(a, b, c) {
      b = zf(b);
      if (zf(a) !== b && c) throw Error(p(425));
    }
    function Bf() {
    }
    var Cf = null, Df = null;
    function Ef(a, b) {
      return "textarea" === a || "noscript" === a || "string" === typeof b.children || "number" === typeof b.children || "object" === typeof b.dangerouslySetInnerHTML && null !== b.dangerouslySetInnerHTML && null != b.dangerouslySetInnerHTML.__html;
    }
    var Ff = "function" === typeof setTimeout ? setTimeout : void 0, Gf = "function" === typeof clearTimeout ? clearTimeout : void 0, Hf = "function" === typeof Promise ? Promise : void 0, Jf = "function" === typeof queueMicrotask ? queueMicrotask : "undefined" !== typeof Hf ? function(a) {
      return Hf.resolve(null).then(a).catch(If);
    } : Ff;
    function If(a) {
      setTimeout(function() {
        throw a;
      });
    }
    function Kf(a, b) {
      var c = b, d = 0;
      do {
        var e = c.nextSibling;
        a.removeChild(c);
        if (e && 8 === e.nodeType) if (c = e.data, "/$" === c) {
          if (0 === d) {
            a.removeChild(e);
            bd(b);
            return;
          }
          d--;
        } else "$" !== c && "$?" !== c && "$!" !== c || d++;
        c = e;
      } while (c);
      bd(b);
    }
    function Lf(a) {
      for (; null != a; a = a.nextSibling) {
        var b = a.nodeType;
        if (1 === b || 3 === b) break;
        if (8 === b) {
          b = a.data;
          if ("$" === b || "$!" === b || "$?" === b) break;
          if ("/$" === b) return null;
        }
      }
      return a;
    }
    function Mf(a) {
      a = a.previousSibling;
      for (var b = 0; a; ) {
        if (8 === a.nodeType) {
          var c = a.data;
          if ("$" === c || "$!" === c || "$?" === c) {
            if (0 === b) return a;
            b--;
          } else "/$" === c && b++;
        }
        a = a.previousSibling;
      }
      return null;
    }
    var Nf = Math.random().toString(36).slice(2), Of = "__reactFiber$" + Nf, Pf = "__reactProps$" + Nf, uf = "__reactContainer$" + Nf, of = "__reactEvents$" + Nf, Qf = "__reactListeners$" + Nf, Rf = "__reactHandles$" + Nf;
    function Wc(a) {
      var b = a[Of];
      if (b) return b;
      for (var c = a.parentNode; c; ) {
        if (b = c[uf] || c[Of]) {
          c = b.alternate;
          if (null !== b.child || null !== c && null !== c.child) for (a = Mf(a); null !== a; ) {
            if (c = a[Of]) return c;
            a = Mf(a);
          }
          return b;
        }
        a = c;
        c = a.parentNode;
      }
      return null;
    }
    function Cb(a) {
      a = a[Of] || a[uf];
      return !a || 5 !== a.tag && 6 !== a.tag && 13 !== a.tag && 3 !== a.tag ? null : a;
    }
    function ue(a) {
      if (5 === a.tag || 6 === a.tag) return a.stateNode;
      throw Error(p(33));
    }
    function Db(a) {
      return a[Pf] || null;
    }
    var Sf = [], Tf = -1;
    function Uf(a) {
      return { current: a };
    }
    function E(a) {
      0 > Tf || (a.current = Sf[Tf], Sf[Tf] = null, Tf--);
    }
    function G(a, b) {
      Tf++;
      Sf[Tf] = a.current;
      a.current = b;
    }
    var Vf = {}, H = Uf(Vf), Wf = Uf(false), Xf = Vf;
    function Yf(a, b) {
      var c = a.type.contextTypes;
      if (!c) return Vf;
      var d = a.stateNode;
      if (d && d.__reactInternalMemoizedUnmaskedChildContext === b) return d.__reactInternalMemoizedMaskedChildContext;
      var e = {}, f;
      for (f in c) e[f] = b[f];
      d && (a = a.stateNode, a.__reactInternalMemoizedUnmaskedChildContext = b, a.__reactInternalMemoizedMaskedChildContext = e);
      return e;
    }
    function Zf(a) {
      a = a.childContextTypes;
      return null !== a && void 0 !== a;
    }
    function $f() {
      E(Wf);
      E(H);
    }
    function ag(a, b, c) {
      if (H.current !== Vf) throw Error(p(168));
      G(H, b);
      G(Wf, c);
    }
    function bg(a, b, c) {
      var d = a.stateNode;
      b = b.childContextTypes;
      if ("function" !== typeof d.getChildContext) return c;
      d = d.getChildContext();
      for (var e in d) if (!(e in b)) throw Error(p(108, Ra(a) || "Unknown", e));
      return A({}, c, d);
    }
    function cg(a) {
      a = (a = a.stateNode) && a.__reactInternalMemoizedMergedChildContext || Vf;
      Xf = H.current;
      G(H, a);
      G(Wf, Wf.current);
      return true;
    }
    function dg(a, b, c) {
      var d = a.stateNode;
      if (!d) throw Error(p(169));
      c ? (a = bg(a, b, Xf), d.__reactInternalMemoizedMergedChildContext = a, E(Wf), E(H), G(H, a)) : E(Wf);
      G(Wf, c);
    }
    var eg = null, fg = false, gg = false;
    function hg(a) {
      null === eg ? eg = [a] : eg.push(a);
    }
    function ig(a) {
      fg = true;
      hg(a);
    }
    function jg() {
      if (!gg && null !== eg) {
        gg = true;
        var a = 0, b = C;
        try {
          var c = eg;
          for (C = 1; a < c.length; a++) {
            var d = c[a];
            do
              d = d(true);
            while (null !== d);
          }
          eg = null;
          fg = false;
        } catch (e) {
          throw null !== eg && (eg = eg.slice(a + 1)), ac(fc, jg), e;
        } finally {
          C = b, gg = false;
        }
      }
      return null;
    }
    var kg = [], lg = 0, mg = null, ng = 0, og = [], pg = 0, qg = null, rg = 1, sg = "";
    function tg(a, b) {
      kg[lg++] = ng;
      kg[lg++] = mg;
      mg = a;
      ng = b;
    }
    function ug(a, b, c) {
      og[pg++] = rg;
      og[pg++] = sg;
      og[pg++] = qg;
      qg = a;
      var d = rg;
      a = sg;
      var e = 32 - oc(d) - 1;
      d &= ~(1 << e);
      c += 1;
      var f = 32 - oc(b) + e;
      if (30 < f) {
        var g = e - e % 5;
        f = (d & (1 << g) - 1).toString(32);
        d >>= g;
        e -= g;
        rg = 1 << 32 - oc(b) + e | c << e | d;
        sg = f + a;
      } else rg = 1 << f | c << e | d, sg = a;
    }
    function vg(a) {
      null !== a.return && (tg(a, 1), ug(a, 1, 0));
    }
    function wg(a) {
      for (; a === mg; ) mg = kg[--lg], kg[lg] = null, ng = kg[--lg], kg[lg] = null;
      for (; a === qg; ) qg = og[--pg], og[pg] = null, sg = og[--pg], og[pg] = null, rg = og[--pg], og[pg] = null;
    }
    var xg = null, yg = null, I = false, zg = null;
    function Ag(a, b) {
      var c = Bg(5, null, null, 0);
      c.elementType = "DELETED";
      c.stateNode = b;
      c.return = a;
      b = a.deletions;
      null === b ? (a.deletions = [c], a.flags |= 16) : b.push(c);
    }
    function Cg(a, b) {
      switch (a.tag) {
        case 5:
          var c = a.type;
          b = 1 !== b.nodeType || c.toLowerCase() !== b.nodeName.toLowerCase() ? null : b;
          return null !== b ? (a.stateNode = b, xg = a, yg = Lf(b.firstChild), true) : false;
        case 6:
          return b = "" === a.pendingProps || 3 !== b.nodeType ? null : b, null !== b ? (a.stateNode = b, xg = a, yg = null, true) : false;
        case 13:
          return b = 8 !== b.nodeType ? null : b, null !== b ? (c = null !== qg ? { id: rg, overflow: sg } : null, a.memoizedState = { dehydrated: b, treeContext: c, retryLane: 1073741824 }, c = Bg(18, null, null, 0), c.stateNode = b, c.return = a, a.child = c, xg = a, yg = null, true) : false;
        default:
          return false;
      }
    }
    function Dg(a) {
      return 0 !== (a.mode & 1) && 0 === (a.flags & 128);
    }
    function Eg(a) {
      if (I) {
        var b = yg;
        if (b) {
          var c = b;
          if (!Cg(a, b)) {
            if (Dg(a)) throw Error(p(418));
            b = Lf(c.nextSibling);
            var d = xg;
            b && Cg(a, b) ? Ag(d, c) : (a.flags = a.flags & -4097 | 2, I = false, xg = a);
          }
        } else {
          if (Dg(a)) throw Error(p(418));
          a.flags = a.flags & -4097 | 2;
          I = false;
          xg = a;
        }
      }
    }
    function Fg(a) {
      for (a = a.return; null !== a && 5 !== a.tag && 3 !== a.tag && 13 !== a.tag; ) a = a.return;
      xg = a;
    }
    function Gg(a) {
      if (a !== xg) return false;
      if (!I) return Fg(a), I = true, false;
      var b;
      (b = 3 !== a.tag) && !(b = 5 !== a.tag) && (b = a.type, b = "head" !== b && "body" !== b && !Ef(a.type, a.memoizedProps));
      if (b && (b = yg)) {
        if (Dg(a)) throw Hg(), Error(p(418));
        for (; b; ) Ag(a, b), b = Lf(b.nextSibling);
      }
      Fg(a);
      if (13 === a.tag) {
        a = a.memoizedState;
        a = null !== a ? a.dehydrated : null;
        if (!a) throw Error(p(317));
        a: {
          a = a.nextSibling;
          for (b = 0; a; ) {
            if (8 === a.nodeType) {
              var c = a.data;
              if ("/$" === c) {
                if (0 === b) {
                  yg = Lf(a.nextSibling);
                  break a;
                }
                b--;
              } else "$" !== c && "$!" !== c && "$?" !== c || b++;
            }
            a = a.nextSibling;
          }
          yg = null;
        }
      } else yg = xg ? Lf(a.stateNode.nextSibling) : null;
      return true;
    }
    function Hg() {
      for (var a = yg; a; ) a = Lf(a.nextSibling);
    }
    function Ig() {
      yg = xg = null;
      I = false;
    }
    function Jg(a) {
      null === zg ? zg = [a] : zg.push(a);
    }
    var Kg = ua.ReactCurrentBatchConfig;
    function Lg(a, b, c) {
      a = c.ref;
      if (null !== a && "function" !== typeof a && "object" !== typeof a) {
        if (c._owner) {
          c = c._owner;
          if (c) {
            if (1 !== c.tag) throw Error(p(309));
            var d = c.stateNode;
          }
          if (!d) throw Error(p(147, a));
          var e = d, f = "" + a;
          if (null !== b && null !== b.ref && "function" === typeof b.ref && b.ref._stringRef === f) return b.ref;
          b = function(a2) {
            var b2 = e.refs;
            null === a2 ? delete b2[f] : b2[f] = a2;
          };
          b._stringRef = f;
          return b;
        }
        if ("string" !== typeof a) throw Error(p(284));
        if (!c._owner) throw Error(p(290, a));
      }
      return a;
    }
    function Mg(a, b) {
      a = Object.prototype.toString.call(b);
      throw Error(p(31, "[object Object]" === a ? "object with keys {" + Object.keys(b).join(", ") + "}" : a));
    }
    function Ng(a) {
      var b = a._init;
      return b(a._payload);
    }
    function Og(a) {
      function b(b2, c2) {
        if (a) {
          var d2 = b2.deletions;
          null === d2 ? (b2.deletions = [c2], b2.flags |= 16) : d2.push(c2);
        }
      }
      function c(c2, d2) {
        if (!a) return null;
        for (; null !== d2; ) b(c2, d2), d2 = d2.sibling;
        return null;
      }
      function d(a2, b2) {
        for (a2 = /* @__PURE__ */ new Map(); null !== b2; ) null !== b2.key ? a2.set(b2.key, b2) : a2.set(b2.index, b2), b2 = b2.sibling;
        return a2;
      }
      function e(a2, b2) {
        a2 = Pg(a2, b2);
        a2.index = 0;
        a2.sibling = null;
        return a2;
      }
      function f(b2, c2, d2) {
        b2.index = d2;
        if (!a) return b2.flags |= 1048576, c2;
        d2 = b2.alternate;
        if (null !== d2) return d2 = d2.index, d2 < c2 ? (b2.flags |= 2, c2) : d2;
        b2.flags |= 2;
        return c2;
      }
      function g(b2) {
        a && null === b2.alternate && (b2.flags |= 2);
        return b2;
      }
      function h(a2, b2, c2, d2) {
        if (null === b2 || 6 !== b2.tag) return b2 = Qg(c2, a2.mode, d2), b2.return = a2, b2;
        b2 = e(b2, c2);
        b2.return = a2;
        return b2;
      }
      function k(a2, b2, c2, d2) {
        var f2 = c2.type;
        if (f2 === ya) return m(a2, b2, c2.props.children, d2, c2.key);
        if (null !== b2 && (b2.elementType === f2 || "object" === typeof f2 && null !== f2 && f2.$$typeof === Ha && Ng(f2) === b2.type)) return d2 = e(b2, c2.props), d2.ref = Lg(a2, b2, c2), d2.return = a2, d2;
        d2 = Rg(c2.type, c2.key, c2.props, null, a2.mode, d2);
        d2.ref = Lg(a2, b2, c2);
        d2.return = a2;
        return d2;
      }
      function l(a2, b2, c2, d2) {
        if (null === b2 || 4 !== b2.tag || b2.stateNode.containerInfo !== c2.containerInfo || b2.stateNode.implementation !== c2.implementation) return b2 = Sg(c2, a2.mode, d2), b2.return = a2, b2;
        b2 = e(b2, c2.children || []);
        b2.return = a2;
        return b2;
      }
      function m(a2, b2, c2, d2, f2) {
        if (null === b2 || 7 !== b2.tag) return b2 = Tg(c2, a2.mode, d2, f2), b2.return = a2, b2;
        b2 = e(b2, c2);
        b2.return = a2;
        return b2;
      }
      function q(a2, b2, c2) {
        if ("string" === typeof b2 && "" !== b2 || "number" === typeof b2) return b2 = Qg("" + b2, a2.mode, c2), b2.return = a2, b2;
        if ("object" === typeof b2 && null !== b2) {
          switch (b2.$$typeof) {
            case va:
              return c2 = Rg(b2.type, b2.key, b2.props, null, a2.mode, c2), c2.ref = Lg(a2, null, b2), c2.return = a2, c2;
            case wa:
              return b2 = Sg(b2, a2.mode, c2), b2.return = a2, b2;
            case Ha:
              var d2 = b2._init;
              return q(a2, d2(b2._payload), c2);
          }
          if (eb(b2) || Ka(b2)) return b2 = Tg(b2, a2.mode, c2, null), b2.return = a2, b2;
          Mg(a2, b2);
        }
        return null;
      }
      function r2(a2, b2, c2, d2) {
        var e2 = null !== b2 ? b2.key : null;
        if ("string" === typeof c2 && "" !== c2 || "number" === typeof c2) return null !== e2 ? null : h(a2, b2, "" + c2, d2);
        if ("object" === typeof c2 && null !== c2) {
          switch (c2.$$typeof) {
            case va:
              return c2.key === e2 ? k(a2, b2, c2, d2) : null;
            case wa:
              return c2.key === e2 ? l(a2, b2, c2, d2) : null;
            case Ha:
              return e2 = c2._init, r2(
                a2,
                b2,
                e2(c2._payload),
                d2
              );
          }
          if (eb(c2) || Ka(c2)) return null !== e2 ? null : m(a2, b2, c2, d2, null);
          Mg(a2, c2);
        }
        return null;
      }
      function y(a2, b2, c2, d2, e2) {
        if ("string" === typeof d2 && "" !== d2 || "number" === typeof d2) return a2 = a2.get(c2) || null, h(b2, a2, "" + d2, e2);
        if ("object" === typeof d2 && null !== d2) {
          switch (d2.$$typeof) {
            case va:
              return a2 = a2.get(null === d2.key ? c2 : d2.key) || null, k(b2, a2, d2, e2);
            case wa:
              return a2 = a2.get(null === d2.key ? c2 : d2.key) || null, l(b2, a2, d2, e2);
            case Ha:
              var f2 = d2._init;
              return y(a2, b2, c2, f2(d2._payload), e2);
          }
          if (eb(d2) || Ka(d2)) return a2 = a2.get(c2) || null, m(b2, a2, d2, e2, null);
          Mg(b2, d2);
        }
        return null;
      }
      function n(e2, g2, h2, k2) {
        for (var l2 = null, m2 = null, u = g2, w = g2 = 0, x = null; null !== u && w < h2.length; w++) {
          u.index > w ? (x = u, u = null) : x = u.sibling;
          var n2 = r2(e2, u, h2[w], k2);
          if (null === n2) {
            null === u && (u = x);
            break;
          }
          a && u && null === n2.alternate && b(e2, u);
          g2 = f(n2, g2, w);
          null === m2 ? l2 = n2 : m2.sibling = n2;
          m2 = n2;
          u = x;
        }
        if (w === h2.length) return c(e2, u), I && tg(e2, w), l2;
        if (null === u) {
          for (; w < h2.length; w++) u = q(e2, h2[w], k2), null !== u && (g2 = f(u, g2, w), null === m2 ? l2 = u : m2.sibling = u, m2 = u);
          I && tg(e2, w);
          return l2;
        }
        for (u = d(e2, u); w < h2.length; w++) x = y(u, e2, w, h2[w], k2), null !== x && (a && null !== x.alternate && u.delete(null === x.key ? w : x.key), g2 = f(x, g2, w), null === m2 ? l2 = x : m2.sibling = x, m2 = x);
        a && u.forEach(function(a2) {
          return b(e2, a2);
        });
        I && tg(e2, w);
        return l2;
      }
      function t(e2, g2, h2, k2) {
        var l2 = Ka(h2);
        if ("function" !== typeof l2) throw Error(p(150));
        h2 = l2.call(h2);
        if (null == h2) throw Error(p(151));
        for (var u = l2 = null, m2 = g2, w = g2 = 0, x = null, n2 = h2.next(); null !== m2 && !n2.done; w++, n2 = h2.next()) {
          m2.index > w ? (x = m2, m2 = null) : x = m2.sibling;
          var t2 = r2(e2, m2, n2.value, k2);
          if (null === t2) {
            null === m2 && (m2 = x);
            break;
          }
          a && m2 && null === t2.alternate && b(e2, m2);
          g2 = f(t2, g2, w);
          null === u ? l2 = t2 : u.sibling = t2;
          u = t2;
          m2 = x;
        }
        if (n2.done) return c(
          e2,
          m2
        ), I && tg(e2, w), l2;
        if (null === m2) {
          for (; !n2.done; w++, n2 = h2.next()) n2 = q(e2, n2.value, k2), null !== n2 && (g2 = f(n2, g2, w), null === u ? l2 = n2 : u.sibling = n2, u = n2);
          I && tg(e2, w);
          return l2;
        }
        for (m2 = d(e2, m2); !n2.done; w++, n2 = h2.next()) n2 = y(m2, e2, w, n2.value, k2), null !== n2 && (a && null !== n2.alternate && m2.delete(null === n2.key ? w : n2.key), g2 = f(n2, g2, w), null === u ? l2 = n2 : u.sibling = n2, u = n2);
        a && m2.forEach(function(a2) {
          return b(e2, a2);
        });
        I && tg(e2, w);
        return l2;
      }
      function J(a2, d2, f2, h2) {
        "object" === typeof f2 && null !== f2 && f2.type === ya && null === f2.key && (f2 = f2.props.children);
        if ("object" === typeof f2 && null !== f2) {
          switch (f2.$$typeof) {
            case va:
              a: {
                for (var k2 = f2.key, l2 = d2; null !== l2; ) {
                  if (l2.key === k2) {
                    k2 = f2.type;
                    if (k2 === ya) {
                      if (7 === l2.tag) {
                        c(a2, l2.sibling);
                        d2 = e(l2, f2.props.children);
                        d2.return = a2;
                        a2 = d2;
                        break a;
                      }
                    } else if (l2.elementType === k2 || "object" === typeof k2 && null !== k2 && k2.$$typeof === Ha && Ng(k2) === l2.type) {
                      c(a2, l2.sibling);
                      d2 = e(l2, f2.props);
                      d2.ref = Lg(a2, l2, f2);
                      d2.return = a2;
                      a2 = d2;
                      break a;
                    }
                    c(a2, l2);
                    break;
                  } else b(a2, l2);
                  l2 = l2.sibling;
                }
                f2.type === ya ? (d2 = Tg(f2.props.children, a2.mode, h2, f2.key), d2.return = a2, a2 = d2) : (h2 = Rg(f2.type, f2.key, f2.props, null, a2.mode, h2), h2.ref = Lg(a2, d2, f2), h2.return = a2, a2 = h2);
              }
              return g(a2);
            case wa:
              a: {
                for (l2 = f2.key; null !== d2; ) {
                  if (d2.key === l2) if (4 === d2.tag && d2.stateNode.containerInfo === f2.containerInfo && d2.stateNode.implementation === f2.implementation) {
                    c(a2, d2.sibling);
                    d2 = e(d2, f2.children || []);
                    d2.return = a2;
                    a2 = d2;
                    break a;
                  } else {
                    c(a2, d2);
                    break;
                  }
                  else b(a2, d2);
                  d2 = d2.sibling;
                }
                d2 = Sg(f2, a2.mode, h2);
                d2.return = a2;
                a2 = d2;
              }
              return g(a2);
            case Ha:
              return l2 = f2._init, J(a2, d2, l2(f2._payload), h2);
          }
          if (eb(f2)) return n(a2, d2, f2, h2);
          if (Ka(f2)) return t(a2, d2, f2, h2);
          Mg(a2, f2);
        }
        return "string" === typeof f2 && "" !== f2 || "number" === typeof f2 ? (f2 = "" + f2, null !== d2 && 6 === d2.tag ? (c(a2, d2.sibling), d2 = e(d2, f2), d2.return = a2, a2 = d2) : (c(a2, d2), d2 = Qg(f2, a2.mode, h2), d2.return = a2, a2 = d2), g(a2)) : c(a2, d2);
      }
      return J;
    }
    var Ug = Og(true), Vg = Og(false), Wg = Uf(null), Xg = null, Yg = null, Zg = null;
    function $g() {
      Zg = Yg = Xg = null;
    }
    function ah(a) {
      var b = Wg.current;
      E(Wg);
      a._currentValue = b;
    }
    function bh(a, b, c) {
      for (; null !== a; ) {
        var d = a.alternate;
        (a.childLanes & b) !== b ? (a.childLanes |= b, null !== d && (d.childLanes |= b)) : null !== d && (d.childLanes & b) !== b && (d.childLanes |= b);
        if (a === c) break;
        a = a.return;
      }
    }
    function ch(a, b) {
      Xg = a;
      Zg = Yg = null;
      a = a.dependencies;
      null !== a && null !== a.firstContext && (0 !== (a.lanes & b) && (dh = true), a.firstContext = null);
    }
    function eh(a) {
      var b = a._currentValue;
      if (Zg !== a) if (a = { context: a, memoizedValue: b, next: null }, null === Yg) {
        if (null === Xg) throw Error(p(308));
        Yg = a;
        Xg.dependencies = { lanes: 0, firstContext: a };
      } else Yg = Yg.next = a;
      return b;
    }
    var fh = null;
    function gh(a) {
      null === fh ? fh = [a] : fh.push(a);
    }
    function hh(a, b, c, d) {
      var e = b.interleaved;
      null === e ? (c.next = c, gh(b)) : (c.next = e.next, e.next = c);
      b.interleaved = c;
      return ih(a, d);
    }
    function ih(a, b) {
      a.lanes |= b;
      var c = a.alternate;
      null !== c && (c.lanes |= b);
      c = a;
      for (a = a.return; null !== a; ) a.childLanes |= b, c = a.alternate, null !== c && (c.childLanes |= b), c = a, a = a.return;
      return 3 === c.tag ? c.stateNode : null;
    }
    var jh = false;
    function kh(a) {
      a.updateQueue = { baseState: a.memoizedState, firstBaseUpdate: null, lastBaseUpdate: null, shared: { pending: null, interleaved: null, lanes: 0 }, effects: null };
    }
    function lh(a, b) {
      a = a.updateQueue;
      b.updateQueue === a && (b.updateQueue = { baseState: a.baseState, firstBaseUpdate: a.firstBaseUpdate, lastBaseUpdate: a.lastBaseUpdate, shared: a.shared, effects: a.effects });
    }
    function mh(a, b) {
      return { eventTime: a, lane: b, tag: 0, payload: null, callback: null, next: null };
    }
    function nh(a, b, c) {
      var d = a.updateQueue;
      if (null === d) return null;
      d = d.shared;
      if (0 !== (K & 2)) {
        var e = d.pending;
        null === e ? b.next = b : (b.next = e.next, e.next = b);
        d.pending = b;
        return ih(a, c);
      }
      e = d.interleaved;
      null === e ? (b.next = b, gh(d)) : (b.next = e.next, e.next = b);
      d.interleaved = b;
      return ih(a, c);
    }
    function oh(a, b, c) {
      b = b.updateQueue;
      if (null !== b && (b = b.shared, 0 !== (c & 4194240))) {
        var d = b.lanes;
        d &= a.pendingLanes;
        c |= d;
        b.lanes = c;
        Cc(a, c);
      }
    }
    function ph(a, b) {
      var c = a.updateQueue, d = a.alternate;
      if (null !== d && (d = d.updateQueue, c === d)) {
        var e = null, f = null;
        c = c.firstBaseUpdate;
        if (null !== c) {
          do {
            var g = { eventTime: c.eventTime, lane: c.lane, tag: c.tag, payload: c.payload, callback: c.callback, next: null };
            null === f ? e = f = g : f = f.next = g;
            c = c.next;
          } while (null !== c);
          null === f ? e = f = b : f = f.next = b;
        } else e = f = b;
        c = { baseState: d.baseState, firstBaseUpdate: e, lastBaseUpdate: f, shared: d.shared, effects: d.effects };
        a.updateQueue = c;
        return;
      }
      a = c.lastBaseUpdate;
      null === a ? c.firstBaseUpdate = b : a.next = b;
      c.lastBaseUpdate = b;
    }
    function qh(a, b, c, d) {
      var e = a.updateQueue;
      jh = false;
      var f = e.firstBaseUpdate, g = e.lastBaseUpdate, h = e.shared.pending;
      if (null !== h) {
        e.shared.pending = null;
        var k = h, l = k.next;
        k.next = null;
        null === g ? f = l : g.next = l;
        g = k;
        var m = a.alternate;
        null !== m && (m = m.updateQueue, h = m.lastBaseUpdate, h !== g && (null === h ? m.firstBaseUpdate = l : h.next = l, m.lastBaseUpdate = k));
      }
      if (null !== f) {
        var q = e.baseState;
        g = 0;
        m = l = k = null;
        h = f;
        do {
          var r2 = h.lane, y = h.eventTime;
          if ((d & r2) === r2) {
            null !== m && (m = m.next = {
              eventTime: y,
              lane: 0,
              tag: h.tag,
              payload: h.payload,
              callback: h.callback,
              next: null
            });
            a: {
              var n = a, t = h;
              r2 = b;
              y = c;
              switch (t.tag) {
                case 1:
                  n = t.payload;
                  if ("function" === typeof n) {
                    q = n.call(y, q, r2);
                    break a;
                  }
                  q = n;
                  break a;
                case 3:
                  n.flags = n.flags & -65537 | 128;
                case 0:
                  n = t.payload;
                  r2 = "function" === typeof n ? n.call(y, q, r2) : n;
                  if (null === r2 || void 0 === r2) break a;
                  q = A({}, q, r2);
                  break a;
                case 2:
                  jh = true;
              }
            }
            null !== h.callback && 0 !== h.lane && (a.flags |= 64, r2 = e.effects, null === r2 ? e.effects = [h] : r2.push(h));
          } else y = { eventTime: y, lane: r2, tag: h.tag, payload: h.payload, callback: h.callback, next: null }, null === m ? (l = m = y, k = q) : m = m.next = y, g |= r2;
          h = h.next;
          if (null === h) if (h = e.shared.pending, null === h) break;
          else r2 = h, h = r2.next, r2.next = null, e.lastBaseUpdate = r2, e.shared.pending = null;
        } while (1);
        null === m && (k = q);
        e.baseState = k;
        e.firstBaseUpdate = l;
        e.lastBaseUpdate = m;
        b = e.shared.interleaved;
        if (null !== b) {
          e = b;
          do
            g |= e.lane, e = e.next;
          while (e !== b);
        } else null === f && (e.shared.lanes = 0);
        rh |= g;
        a.lanes = g;
        a.memoizedState = q;
      }
    }
    function sh(a, b, c) {
      a = b.effects;
      b.effects = null;
      if (null !== a) for (b = 0; b < a.length; b++) {
        var d = a[b], e = d.callback;
        if (null !== e) {
          d.callback = null;
          d = c;
          if ("function" !== typeof e) throw Error(p(191, e));
          e.call(d);
        }
      }
    }
    var th = {}, uh = Uf(th), vh = Uf(th), wh = Uf(th);
    function xh(a) {
      if (a === th) throw Error(p(174));
      return a;
    }
    function yh(a, b) {
      G(wh, b);
      G(vh, a);
      G(uh, th);
      a = b.nodeType;
      switch (a) {
        case 9:
        case 11:
          b = (b = b.documentElement) ? b.namespaceURI : lb(null, "");
          break;
        default:
          a = 8 === a ? b.parentNode : b, b = a.namespaceURI || null, a = a.tagName, b = lb(b, a);
      }
      E(uh);
      G(uh, b);
    }
    function zh() {
      E(uh);
      E(vh);
      E(wh);
    }
    function Ah(a) {
      xh(wh.current);
      var b = xh(uh.current);
      var c = lb(b, a.type);
      b !== c && (G(vh, a), G(uh, c));
    }
    function Bh(a) {
      vh.current === a && (E(uh), E(vh));
    }
    var L = Uf(0);
    function Ch(a) {
      for (var b = a; null !== b; ) {
        if (13 === b.tag) {
          var c = b.memoizedState;
          if (null !== c && (c = c.dehydrated, null === c || "$?" === c.data || "$!" === c.data)) return b;
        } else if (19 === b.tag && void 0 !== b.memoizedProps.revealOrder) {
          if (0 !== (b.flags & 128)) return b;
        } else if (null !== b.child) {
          b.child.return = b;
          b = b.child;
          continue;
        }
        if (b === a) break;
        for (; null === b.sibling; ) {
          if (null === b.return || b.return === a) return null;
          b = b.return;
        }
        b.sibling.return = b.return;
        b = b.sibling;
      }
      return null;
    }
    var Dh = [];
    function Eh() {
      for (var a = 0; a < Dh.length; a++) Dh[a]._workInProgressVersionPrimary = null;
      Dh.length = 0;
    }
    var Fh = ua.ReactCurrentDispatcher, Gh = ua.ReactCurrentBatchConfig, Hh = 0, M = null, N = null, O = null, Ih = false, Jh = false, Kh = 0, Lh = 0;
    function P() {
      throw Error(p(321));
    }
    function Mh(a, b) {
      if (null === b) return false;
      for (var c = 0; c < b.length && c < a.length; c++) if (!He(a[c], b[c])) return false;
      return true;
    }
    function Nh(a, b, c, d, e, f) {
      Hh = f;
      M = b;
      b.memoizedState = null;
      b.updateQueue = null;
      b.lanes = 0;
      Fh.current = null === a || null === a.memoizedState ? Oh : Ph;
      a = c(d, e);
      if (Jh) {
        f = 0;
        do {
          Jh = false;
          Kh = 0;
          if (25 <= f) throw Error(p(301));
          f += 1;
          O = N = null;
          b.updateQueue = null;
          Fh.current = Qh;
          a = c(d, e);
        } while (Jh);
      }
      Fh.current = Rh;
      b = null !== N && null !== N.next;
      Hh = 0;
      O = N = M = null;
      Ih = false;
      if (b) throw Error(p(300));
      return a;
    }
    function Sh() {
      var a = 0 !== Kh;
      Kh = 0;
      return a;
    }
    function Th() {
      var a = { memoizedState: null, baseState: null, baseQueue: null, queue: null, next: null };
      null === O ? M.memoizedState = O = a : O = O.next = a;
      return O;
    }
    function Uh() {
      if (null === N) {
        var a = M.alternate;
        a = null !== a ? a.memoizedState : null;
      } else a = N.next;
      var b = null === O ? M.memoizedState : O.next;
      if (null !== b) O = b, N = a;
      else {
        if (null === a) throw Error(p(310));
        N = a;
        a = { memoizedState: N.memoizedState, baseState: N.baseState, baseQueue: N.baseQueue, queue: N.queue, next: null };
        null === O ? M.memoizedState = O = a : O = O.next = a;
      }
      return O;
    }
    function Vh(a, b) {
      return "function" === typeof b ? b(a) : b;
    }
    function Wh(a) {
      var b = Uh(), c = b.queue;
      if (null === c) throw Error(p(311));
      c.lastRenderedReducer = a;
      var d = N, e = d.baseQueue, f = c.pending;
      if (null !== f) {
        if (null !== e) {
          var g = e.next;
          e.next = f.next;
          f.next = g;
        }
        d.baseQueue = e = f;
        c.pending = null;
      }
      if (null !== e) {
        f = e.next;
        d = d.baseState;
        var h = g = null, k = null, l = f;
        do {
          var m = l.lane;
          if ((Hh & m) === m) null !== k && (k = k.next = { lane: 0, action: l.action, hasEagerState: l.hasEagerState, eagerState: l.eagerState, next: null }), d = l.hasEagerState ? l.eagerState : a(d, l.action);
          else {
            var q = {
              lane: m,
              action: l.action,
              hasEagerState: l.hasEagerState,
              eagerState: l.eagerState,
              next: null
            };
            null === k ? (h = k = q, g = d) : k = k.next = q;
            M.lanes |= m;
            rh |= m;
          }
          l = l.next;
        } while (null !== l && l !== f);
        null === k ? g = d : k.next = h;
        He(d, b.memoizedState) || (dh = true);
        b.memoizedState = d;
        b.baseState = g;
        b.baseQueue = k;
        c.lastRenderedState = d;
      }
      a = c.interleaved;
      if (null !== a) {
        e = a;
        do
          f = e.lane, M.lanes |= f, rh |= f, e = e.next;
        while (e !== a);
      } else null === e && (c.lanes = 0);
      return [b.memoizedState, c.dispatch];
    }
    function Xh(a) {
      var b = Uh(), c = b.queue;
      if (null === c) throw Error(p(311));
      c.lastRenderedReducer = a;
      var d = c.dispatch, e = c.pending, f = b.memoizedState;
      if (null !== e) {
        c.pending = null;
        var g = e = e.next;
        do
          f = a(f, g.action), g = g.next;
        while (g !== e);
        He(f, b.memoizedState) || (dh = true);
        b.memoizedState = f;
        null === b.baseQueue && (b.baseState = f);
        c.lastRenderedState = f;
      }
      return [f, d];
    }
    function Yh() {
    }
    function Zh(a, b) {
      var c = M, d = Uh(), e = b(), f = !He(d.memoizedState, e);
      f && (d.memoizedState = e, dh = true);
      d = d.queue;
      $h(ai.bind(null, c, d, a), [a]);
      if (d.getSnapshot !== b || f || null !== O && O.memoizedState.tag & 1) {
        c.flags |= 2048;
        bi(9, ci.bind(null, c, d, e, b), void 0, null);
        if (null === Q) throw Error(p(349));
        0 !== (Hh & 30) || di(c, b, e);
      }
      return e;
    }
    function di(a, b, c) {
      a.flags |= 16384;
      a = { getSnapshot: b, value: c };
      b = M.updateQueue;
      null === b ? (b = { lastEffect: null, stores: null }, M.updateQueue = b, b.stores = [a]) : (c = b.stores, null === c ? b.stores = [a] : c.push(a));
    }
    function ci(a, b, c, d) {
      b.value = c;
      b.getSnapshot = d;
      ei(b) && fi(a);
    }
    function ai(a, b, c) {
      return c(function() {
        ei(b) && fi(a);
      });
    }
    function ei(a) {
      var b = a.getSnapshot;
      a = a.value;
      try {
        var c = b();
        return !He(a, c);
      } catch (d) {
        return true;
      }
    }
    function fi(a) {
      var b = ih(a, 1);
      null !== b && gi(b, a, 1, -1);
    }
    function hi(a) {
      var b = Th();
      "function" === typeof a && (a = a());
      b.memoizedState = b.baseState = a;
      a = { pending: null, interleaved: null, lanes: 0, dispatch: null, lastRenderedReducer: Vh, lastRenderedState: a };
      b.queue = a;
      a = a.dispatch = ii.bind(null, M, a);
      return [b.memoizedState, a];
    }
    function bi(a, b, c, d) {
      a = { tag: a, create: b, destroy: c, deps: d, next: null };
      b = M.updateQueue;
      null === b ? (b = { lastEffect: null, stores: null }, M.updateQueue = b, b.lastEffect = a.next = a) : (c = b.lastEffect, null === c ? b.lastEffect = a.next = a : (d = c.next, c.next = a, a.next = d, b.lastEffect = a));
      return a;
    }
    function ji() {
      return Uh().memoizedState;
    }
    function ki(a, b, c, d) {
      var e = Th();
      M.flags |= a;
      e.memoizedState = bi(1 | b, c, void 0, void 0 === d ? null : d);
    }
    function li(a, b, c, d) {
      var e = Uh();
      d = void 0 === d ? null : d;
      var f = void 0;
      if (null !== N) {
        var g = N.memoizedState;
        f = g.destroy;
        if (null !== d && Mh(d, g.deps)) {
          e.memoizedState = bi(b, c, f, d);
          return;
        }
      }
      M.flags |= a;
      e.memoizedState = bi(1 | b, c, f, d);
    }
    function mi(a, b) {
      return ki(8390656, 8, a, b);
    }
    function $h(a, b) {
      return li(2048, 8, a, b);
    }
    function ni(a, b) {
      return li(4, 2, a, b);
    }
    function oi(a, b) {
      return li(4, 4, a, b);
    }
    function pi(a, b) {
      if ("function" === typeof b) return a = a(), b(a), function() {
        b(null);
      };
      if (null !== b && void 0 !== b) return a = a(), b.current = a, function() {
        b.current = null;
      };
    }
    function qi(a, b, c) {
      c = null !== c && void 0 !== c ? c.concat([a]) : null;
      return li(4, 4, pi.bind(null, b, a), c);
    }
    function ri() {
    }
    function si(a, b) {
      var c = Uh();
      b = void 0 === b ? null : b;
      var d = c.memoizedState;
      if (null !== d && null !== b && Mh(b, d[1])) return d[0];
      c.memoizedState = [a, b];
      return a;
    }
    function ti(a, b) {
      var c = Uh();
      b = void 0 === b ? null : b;
      var d = c.memoizedState;
      if (null !== d && null !== b && Mh(b, d[1])) return d[0];
      a = a();
      c.memoizedState = [a, b];
      return a;
    }
    function ui(a, b, c) {
      if (0 === (Hh & 21)) return a.baseState && (a.baseState = false, dh = true), a.memoizedState = c;
      He(c, b) || (c = yc(), M.lanes |= c, rh |= c, a.baseState = true);
      return b;
    }
    function vi(a, b) {
      var c = C;
      C = 0 !== c && 4 > c ? c : 4;
      a(true);
      var d = Gh.transition;
      Gh.transition = {};
      try {
        a(false), b();
      } finally {
        C = c, Gh.transition = d;
      }
    }
    function wi() {
      return Uh().memoizedState;
    }
    function xi(a, b, c) {
      var d = yi(a);
      c = { lane: d, action: c, hasEagerState: false, eagerState: null, next: null };
      if (zi(a)) Ai(b, c);
      else if (c = hh(a, b, c, d), null !== c) {
        var e = R();
        gi(c, a, d, e);
        Bi(c, b, d);
      }
    }
    function ii(a, b, c) {
      var d = yi(a), e = { lane: d, action: c, hasEagerState: false, eagerState: null, next: null };
      if (zi(a)) Ai(b, e);
      else {
        var f = a.alternate;
        if (0 === a.lanes && (null === f || 0 === f.lanes) && (f = b.lastRenderedReducer, null !== f)) try {
          var g = b.lastRenderedState, h = f(g, c);
          e.hasEagerState = true;
          e.eagerState = h;
          if (He(h, g)) {
            var k = b.interleaved;
            null === k ? (e.next = e, gh(b)) : (e.next = k.next, k.next = e);
            b.interleaved = e;
            return;
          }
        } catch (l) {
        } finally {
        }
        c = hh(a, b, e, d);
        null !== c && (e = R(), gi(c, a, d, e), Bi(c, b, d));
      }
    }
    function zi(a) {
      var b = a.alternate;
      return a === M || null !== b && b === M;
    }
    function Ai(a, b) {
      Jh = Ih = true;
      var c = a.pending;
      null === c ? b.next = b : (b.next = c.next, c.next = b);
      a.pending = b;
    }
    function Bi(a, b, c) {
      if (0 !== (c & 4194240)) {
        var d = b.lanes;
        d &= a.pendingLanes;
        c |= d;
        b.lanes = c;
        Cc(a, c);
      }
    }
    var Rh = { readContext: eh, useCallback: P, useContext: P, useEffect: P, useImperativeHandle: P, useInsertionEffect: P, useLayoutEffect: P, useMemo: P, useReducer: P, useRef: P, useState: P, useDebugValue: P, useDeferredValue: P, useTransition: P, useMutableSource: P, useSyncExternalStore: P, useId: P, unstable_isNewReconciler: false }, Oh = { readContext: eh, useCallback: function(a, b) {
      Th().memoizedState = [a, void 0 === b ? null : b];
      return a;
    }, useContext: eh, useEffect: mi, useImperativeHandle: function(a, b, c) {
      c = null !== c && void 0 !== c ? c.concat([a]) : null;
      return ki(
        4194308,
        4,
        pi.bind(null, b, a),
        c
      );
    }, useLayoutEffect: function(a, b) {
      return ki(4194308, 4, a, b);
    }, useInsertionEffect: function(a, b) {
      return ki(4, 2, a, b);
    }, useMemo: function(a, b) {
      var c = Th();
      b = void 0 === b ? null : b;
      a = a();
      c.memoizedState = [a, b];
      return a;
    }, useReducer: function(a, b, c) {
      var d = Th();
      b = void 0 !== c ? c(b) : b;
      d.memoizedState = d.baseState = b;
      a = { pending: null, interleaved: null, lanes: 0, dispatch: null, lastRenderedReducer: a, lastRenderedState: b };
      d.queue = a;
      a = a.dispatch = xi.bind(null, M, a);
      return [d.memoizedState, a];
    }, useRef: function(a) {
      var b = Th();
      a = { current: a };
      return b.memoizedState = a;
    }, useState: hi, useDebugValue: ri, useDeferredValue: function(a) {
      return Th().memoizedState = a;
    }, useTransition: function() {
      var a = hi(false), b = a[0];
      a = vi.bind(null, a[1]);
      Th().memoizedState = a;
      return [b, a];
    }, useMutableSource: function() {
    }, useSyncExternalStore: function(a, b, c) {
      var d = M, e = Th();
      if (I) {
        if (void 0 === c) throw Error(p(407));
        c = c();
      } else {
        c = b();
        if (null === Q) throw Error(p(349));
        0 !== (Hh & 30) || di(d, b, c);
      }
      e.memoizedState = c;
      var f = { value: c, getSnapshot: b };
      e.queue = f;
      mi(ai.bind(
        null,
        d,
        f,
        a
      ), [a]);
      d.flags |= 2048;
      bi(9, ci.bind(null, d, f, c, b), void 0, null);
      return c;
    }, useId: function() {
      var a = Th(), b = Q.identifierPrefix;
      if (I) {
        var c = sg;
        var d = rg;
        c = (d & ~(1 << 32 - oc(d) - 1)).toString(32) + c;
        b = ":" + b + "R" + c;
        c = Kh++;
        0 < c && (b += "H" + c.toString(32));
        b += ":";
      } else c = Lh++, b = ":" + b + "r" + c.toString(32) + ":";
      return a.memoizedState = b;
    }, unstable_isNewReconciler: false }, Ph = {
      readContext: eh,
      useCallback: si,
      useContext: eh,
      useEffect: $h,
      useImperativeHandle: qi,
      useInsertionEffect: ni,
      useLayoutEffect: oi,
      useMemo: ti,
      useReducer: Wh,
      useRef: ji,
      useState: function() {
        return Wh(Vh);
      },
      useDebugValue: ri,
      useDeferredValue: function(a) {
        var b = Uh();
        return ui(b, N.memoizedState, a);
      },
      useTransition: function() {
        var a = Wh(Vh)[0], b = Uh().memoizedState;
        return [a, b];
      },
      useMutableSource: Yh,
      useSyncExternalStore: Zh,
      useId: wi,
      unstable_isNewReconciler: false
    }, Qh = { readContext: eh, useCallback: si, useContext: eh, useEffect: $h, useImperativeHandle: qi, useInsertionEffect: ni, useLayoutEffect: oi, useMemo: ti, useReducer: Xh, useRef: ji, useState: function() {
      return Xh(Vh);
    }, useDebugValue: ri, useDeferredValue: function(a) {
      var b = Uh();
      return null === N ? b.memoizedState = a : ui(b, N.memoizedState, a);
    }, useTransition: function() {
      var a = Xh(Vh)[0], b = Uh().memoizedState;
      return [a, b];
    }, useMutableSource: Yh, useSyncExternalStore: Zh, useId: wi, unstable_isNewReconciler: false };
    function Ci(a, b) {
      if (a && a.defaultProps) {
        b = A({}, b);
        a = a.defaultProps;
        for (var c in a) void 0 === b[c] && (b[c] = a[c]);
        return b;
      }
      return b;
    }
    function Di(a, b, c, d) {
      b = a.memoizedState;
      c = c(d, b);
      c = null === c || void 0 === c ? b : A({}, b, c);
      a.memoizedState = c;
      0 === a.lanes && (a.updateQueue.baseState = c);
    }
    var Ei = { isMounted: function(a) {
      return (a = a._reactInternals) ? Vb(a) === a : false;
    }, enqueueSetState: function(a, b, c) {
      a = a._reactInternals;
      var d = R(), e = yi(a), f = mh(d, e);
      f.payload = b;
      void 0 !== c && null !== c && (f.callback = c);
      b = nh(a, f, e);
      null !== b && (gi(b, a, e, d), oh(b, a, e));
    }, enqueueReplaceState: function(a, b, c) {
      a = a._reactInternals;
      var d = R(), e = yi(a), f = mh(d, e);
      f.tag = 1;
      f.payload = b;
      void 0 !== c && null !== c && (f.callback = c);
      b = nh(a, f, e);
      null !== b && (gi(b, a, e, d), oh(b, a, e));
    }, enqueueForceUpdate: function(a, b) {
      a = a._reactInternals;
      var c = R(), d = yi(a), e = mh(c, d);
      e.tag = 2;
      void 0 !== b && null !== b && (e.callback = b);
      b = nh(a, e, d);
      null !== b && (gi(b, a, d, c), oh(b, a, d));
    } };
    function Fi(a, b, c, d, e, f, g) {
      a = a.stateNode;
      return "function" === typeof a.shouldComponentUpdate ? a.shouldComponentUpdate(d, f, g) : b.prototype && b.prototype.isPureReactComponent ? !Ie(c, d) || !Ie(e, f) : true;
    }
    function Gi(a, b, c) {
      var d = false, e = Vf;
      var f = b.contextType;
      "object" === typeof f && null !== f ? f = eh(f) : (e = Zf(b) ? Xf : H.current, d = b.contextTypes, f = (d = null !== d && void 0 !== d) ? Yf(a, e) : Vf);
      b = new b(c, f);
      a.memoizedState = null !== b.state && void 0 !== b.state ? b.state : null;
      b.updater = Ei;
      a.stateNode = b;
      b._reactInternals = a;
      d && (a = a.stateNode, a.__reactInternalMemoizedUnmaskedChildContext = e, a.__reactInternalMemoizedMaskedChildContext = f);
      return b;
    }
    function Hi(a, b, c, d) {
      a = b.state;
      "function" === typeof b.componentWillReceiveProps && b.componentWillReceiveProps(c, d);
      "function" === typeof b.UNSAFE_componentWillReceiveProps && b.UNSAFE_componentWillReceiveProps(c, d);
      b.state !== a && Ei.enqueueReplaceState(b, b.state, null);
    }
    function Ii(a, b, c, d) {
      var e = a.stateNode;
      e.props = c;
      e.state = a.memoizedState;
      e.refs = {};
      kh(a);
      var f = b.contextType;
      "object" === typeof f && null !== f ? e.context = eh(f) : (f = Zf(b) ? Xf : H.current, e.context = Yf(a, f));
      e.state = a.memoizedState;
      f = b.getDerivedStateFromProps;
      "function" === typeof f && (Di(a, b, f, c), e.state = a.memoizedState);
      "function" === typeof b.getDerivedStateFromProps || "function" === typeof e.getSnapshotBeforeUpdate || "function" !== typeof e.UNSAFE_componentWillMount && "function" !== typeof e.componentWillMount || (b = e.state, "function" === typeof e.componentWillMount && e.componentWillMount(), "function" === typeof e.UNSAFE_componentWillMount && e.UNSAFE_componentWillMount(), b !== e.state && Ei.enqueueReplaceState(e, e.state, null), qh(a, c, e, d), e.state = a.memoizedState);
      "function" === typeof e.componentDidMount && (a.flags |= 4194308);
    }
    function Ji(a, b) {
      try {
        var c = "", d = b;
        do
          c += Pa(d), d = d.return;
        while (d);
        var e = c;
      } catch (f) {
        e = "\nError generating stack: " + f.message + "\n" + f.stack;
      }
      return { value: a, source: b, stack: e, digest: null };
    }
    function Ki(a, b, c) {
      return { value: a, source: null, stack: null != c ? c : null, digest: null != b ? b : null };
    }
    function Li(a, b) {
      try {
        console.error(b.value);
      } catch (c) {
        setTimeout(function() {
          throw c;
        });
      }
    }
    var Mi = "function" === typeof WeakMap ? WeakMap : Map;
    function Ni(a, b, c) {
      c = mh(-1, c);
      c.tag = 3;
      c.payload = { element: null };
      var d = b.value;
      c.callback = function() {
        Oi || (Oi = true, Pi = d);
        Li(a, b);
      };
      return c;
    }
    function Qi(a, b, c) {
      c = mh(-1, c);
      c.tag = 3;
      var d = a.type.getDerivedStateFromError;
      if ("function" === typeof d) {
        var e = b.value;
        c.payload = function() {
          return d(e);
        };
        c.callback = function() {
          Li(a, b);
        };
      }
      var f = a.stateNode;
      null !== f && "function" === typeof f.componentDidCatch && (c.callback = function() {
        Li(a, b);
        "function" !== typeof d && (null === Ri ? Ri = /* @__PURE__ */ new Set([this]) : Ri.add(this));
        var c2 = b.stack;
        this.componentDidCatch(b.value, { componentStack: null !== c2 ? c2 : "" });
      });
      return c;
    }
    function Si(a, b, c) {
      var d = a.pingCache;
      if (null === d) {
        d = a.pingCache = new Mi();
        var e = /* @__PURE__ */ new Set();
        d.set(b, e);
      } else e = d.get(b), void 0 === e && (e = /* @__PURE__ */ new Set(), d.set(b, e));
      e.has(c) || (e.add(c), a = Ti.bind(null, a, b, c), b.then(a, a));
    }
    function Ui(a) {
      do {
        var b;
        if (b = 13 === a.tag) b = a.memoizedState, b = null !== b ? null !== b.dehydrated ? true : false : true;
        if (b) return a;
        a = a.return;
      } while (null !== a);
      return null;
    }
    function Vi(a, b, c, d, e) {
      if (0 === (a.mode & 1)) return a === b ? a.flags |= 65536 : (a.flags |= 128, c.flags |= 131072, c.flags &= -52805, 1 === c.tag && (null === c.alternate ? c.tag = 17 : (b = mh(-1, 1), b.tag = 2, nh(c, b, 1))), c.lanes |= 1), a;
      a.flags |= 65536;
      a.lanes = e;
      return a;
    }
    var Wi = ua.ReactCurrentOwner, dh = false;
    function Xi(a, b, c, d) {
      b.child = null === a ? Vg(b, null, c, d) : Ug(b, a.child, c, d);
    }
    function Yi(a, b, c, d, e) {
      c = c.render;
      var f = b.ref;
      ch(b, e);
      d = Nh(a, b, c, d, f, e);
      c = Sh();
      if (null !== a && !dh) return b.updateQueue = a.updateQueue, b.flags &= -2053, a.lanes &= ~e, Zi(a, b, e);
      I && c && vg(b);
      b.flags |= 1;
      Xi(a, b, d, e);
      return b.child;
    }
    function $i(a, b, c, d, e) {
      if (null === a) {
        var f = c.type;
        if ("function" === typeof f && !aj(f) && void 0 === f.defaultProps && null === c.compare && void 0 === c.defaultProps) return b.tag = 15, b.type = f, bj(a, b, f, d, e);
        a = Rg(c.type, null, d, b, b.mode, e);
        a.ref = b.ref;
        a.return = b;
        return b.child = a;
      }
      f = a.child;
      if (0 === (a.lanes & e)) {
        var g = f.memoizedProps;
        c = c.compare;
        c = null !== c ? c : Ie;
        if (c(g, d) && a.ref === b.ref) return Zi(a, b, e);
      }
      b.flags |= 1;
      a = Pg(f, d);
      a.ref = b.ref;
      a.return = b;
      return b.child = a;
    }
    function bj(a, b, c, d, e) {
      if (null !== a) {
        var f = a.memoizedProps;
        if (Ie(f, d) && a.ref === b.ref) if (dh = false, b.pendingProps = d = f, 0 !== (a.lanes & e)) 0 !== (a.flags & 131072) && (dh = true);
        else return b.lanes = a.lanes, Zi(a, b, e);
      }
      return cj(a, b, c, d, e);
    }
    function dj(a, b, c) {
      var d = b.pendingProps, e = d.children, f = null !== a ? a.memoizedState : null;
      if ("hidden" === d.mode) if (0 === (b.mode & 1)) b.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }, G(ej, fj), fj |= c;
      else {
        if (0 === (c & 1073741824)) return a = null !== f ? f.baseLanes | c : c, b.lanes = b.childLanes = 1073741824, b.memoizedState = { baseLanes: a, cachePool: null, transitions: null }, b.updateQueue = null, G(ej, fj), fj |= a, null;
        b.memoizedState = { baseLanes: 0, cachePool: null, transitions: null };
        d = null !== f ? f.baseLanes : c;
        G(ej, fj);
        fj |= d;
      }
      else null !== f ? (d = f.baseLanes | c, b.memoizedState = null) : d = c, G(ej, fj), fj |= d;
      Xi(a, b, e, c);
      return b.child;
    }
    function gj(a, b) {
      var c = b.ref;
      if (null === a && null !== c || null !== a && a.ref !== c) b.flags |= 512, b.flags |= 2097152;
    }
    function cj(a, b, c, d, e) {
      var f = Zf(c) ? Xf : H.current;
      f = Yf(b, f);
      ch(b, e);
      c = Nh(a, b, c, d, f, e);
      d = Sh();
      if (null !== a && !dh) return b.updateQueue = a.updateQueue, b.flags &= -2053, a.lanes &= ~e, Zi(a, b, e);
      I && d && vg(b);
      b.flags |= 1;
      Xi(a, b, c, e);
      return b.child;
    }
    function hj(a, b, c, d, e) {
      if (Zf(c)) {
        var f = true;
        cg(b);
      } else f = false;
      ch(b, e);
      if (null === b.stateNode) ij(a, b), Gi(b, c, d), Ii(b, c, d, e), d = true;
      else if (null === a) {
        var g = b.stateNode, h = b.memoizedProps;
        g.props = h;
        var k = g.context, l = c.contextType;
        "object" === typeof l && null !== l ? l = eh(l) : (l = Zf(c) ? Xf : H.current, l = Yf(b, l));
        var m = c.getDerivedStateFromProps, q = "function" === typeof m || "function" === typeof g.getSnapshotBeforeUpdate;
        q || "function" !== typeof g.UNSAFE_componentWillReceiveProps && "function" !== typeof g.componentWillReceiveProps || (h !== d || k !== l) && Hi(b, g, d, l);
        jh = false;
        var r2 = b.memoizedState;
        g.state = r2;
        qh(b, d, g, e);
        k = b.memoizedState;
        h !== d || r2 !== k || Wf.current || jh ? ("function" === typeof m && (Di(b, c, m, d), k = b.memoizedState), (h = jh || Fi(b, c, h, d, r2, k, l)) ? (q || "function" !== typeof g.UNSAFE_componentWillMount && "function" !== typeof g.componentWillMount || ("function" === typeof g.componentWillMount && g.componentWillMount(), "function" === typeof g.UNSAFE_componentWillMount && g.UNSAFE_componentWillMount()), "function" === typeof g.componentDidMount && (b.flags |= 4194308)) : ("function" === typeof g.componentDidMount && (b.flags |= 4194308), b.memoizedProps = d, b.memoizedState = k), g.props = d, g.state = k, g.context = l, d = h) : ("function" === typeof g.componentDidMount && (b.flags |= 4194308), d = false);
      } else {
        g = b.stateNode;
        lh(a, b);
        h = b.memoizedProps;
        l = b.type === b.elementType ? h : Ci(b.type, h);
        g.props = l;
        q = b.pendingProps;
        r2 = g.context;
        k = c.contextType;
        "object" === typeof k && null !== k ? k = eh(k) : (k = Zf(c) ? Xf : H.current, k = Yf(b, k));
        var y = c.getDerivedStateFromProps;
        (m = "function" === typeof y || "function" === typeof g.getSnapshotBeforeUpdate) || "function" !== typeof g.UNSAFE_componentWillReceiveProps && "function" !== typeof g.componentWillReceiveProps || (h !== q || r2 !== k) && Hi(b, g, d, k);
        jh = false;
        r2 = b.memoizedState;
        g.state = r2;
        qh(b, d, g, e);
        var n = b.memoizedState;
        h !== q || r2 !== n || Wf.current || jh ? ("function" === typeof y && (Di(b, c, y, d), n = b.memoizedState), (l = jh || Fi(b, c, l, d, r2, n, k) || false) ? (m || "function" !== typeof g.UNSAFE_componentWillUpdate && "function" !== typeof g.componentWillUpdate || ("function" === typeof g.componentWillUpdate && g.componentWillUpdate(d, n, k), "function" === typeof g.UNSAFE_componentWillUpdate && g.UNSAFE_componentWillUpdate(d, n, k)), "function" === typeof g.componentDidUpdate && (b.flags |= 4), "function" === typeof g.getSnapshotBeforeUpdate && (b.flags |= 1024)) : ("function" !== typeof g.componentDidUpdate || h === a.memoizedProps && r2 === a.memoizedState || (b.flags |= 4), "function" !== typeof g.getSnapshotBeforeUpdate || h === a.memoizedProps && r2 === a.memoizedState || (b.flags |= 1024), b.memoizedProps = d, b.memoizedState = n), g.props = d, g.state = n, g.context = k, d = l) : ("function" !== typeof g.componentDidUpdate || h === a.memoizedProps && r2 === a.memoizedState || (b.flags |= 4), "function" !== typeof g.getSnapshotBeforeUpdate || h === a.memoizedProps && r2 === a.memoizedState || (b.flags |= 1024), d = false);
      }
      return jj(a, b, c, d, f, e);
    }
    function jj(a, b, c, d, e, f) {
      gj(a, b);
      var g = 0 !== (b.flags & 128);
      if (!d && !g) return e && dg(b, c, false), Zi(a, b, f);
      d = b.stateNode;
      Wi.current = b;
      var h = g && "function" !== typeof c.getDerivedStateFromError ? null : d.render();
      b.flags |= 1;
      null !== a && g ? (b.child = Ug(b, a.child, null, f), b.child = Ug(b, null, h, f)) : Xi(a, b, h, f);
      b.memoizedState = d.state;
      e && dg(b, c, true);
      return b.child;
    }
    function kj(a) {
      var b = a.stateNode;
      b.pendingContext ? ag(a, b.pendingContext, b.pendingContext !== b.context) : b.context && ag(a, b.context, false);
      yh(a, b.containerInfo);
    }
    function lj(a, b, c, d, e) {
      Ig();
      Jg(e);
      b.flags |= 256;
      Xi(a, b, c, d);
      return b.child;
    }
    var mj = { dehydrated: null, treeContext: null, retryLane: 0 };
    function nj(a) {
      return { baseLanes: a, cachePool: null, transitions: null };
    }
    function oj(a, b, c) {
      var d = b.pendingProps, e = L.current, f = false, g = 0 !== (b.flags & 128), h;
      (h = g) || (h = null !== a && null === a.memoizedState ? false : 0 !== (e & 2));
      if (h) f = true, b.flags &= -129;
      else if (null === a || null !== a.memoizedState) e |= 1;
      G(L, e & 1);
      if (null === a) {
        Eg(b);
        a = b.memoizedState;
        if (null !== a && (a = a.dehydrated, null !== a)) return 0 === (b.mode & 1) ? b.lanes = 1 : "$!" === a.data ? b.lanes = 8 : b.lanes = 1073741824, null;
        g = d.children;
        a = d.fallback;
        return f ? (d = b.mode, f = b.child, g = { mode: "hidden", children: g }, 0 === (d & 1) && null !== f ? (f.childLanes = 0, f.pendingProps = g) : f = pj(g, d, 0, null), a = Tg(a, d, c, null), f.return = b, a.return = b, f.sibling = a, b.child = f, b.child.memoizedState = nj(c), b.memoizedState = mj, a) : qj(b, g);
      }
      e = a.memoizedState;
      if (null !== e && (h = e.dehydrated, null !== h)) return rj(a, b, g, d, h, e, c);
      if (f) {
        f = d.fallback;
        g = b.mode;
        e = a.child;
        h = e.sibling;
        var k = { mode: "hidden", children: d.children };
        0 === (g & 1) && b.child !== e ? (d = b.child, d.childLanes = 0, d.pendingProps = k, b.deletions = null) : (d = Pg(e, k), d.subtreeFlags = e.subtreeFlags & 14680064);
        null !== h ? f = Pg(h, f) : (f = Tg(f, g, c, null), f.flags |= 2);
        f.return = b;
        d.return = b;
        d.sibling = f;
        b.child = d;
        d = f;
        f = b.child;
        g = a.child.memoizedState;
        g = null === g ? nj(c) : { baseLanes: g.baseLanes | c, cachePool: null, transitions: g.transitions };
        f.memoizedState = g;
        f.childLanes = a.childLanes & ~c;
        b.memoizedState = mj;
        return d;
      }
      f = a.child;
      a = f.sibling;
      d = Pg(f, { mode: "visible", children: d.children });
      0 === (b.mode & 1) && (d.lanes = c);
      d.return = b;
      d.sibling = null;
      null !== a && (c = b.deletions, null === c ? (b.deletions = [a], b.flags |= 16) : c.push(a));
      b.child = d;
      b.memoizedState = null;
      return d;
    }
    function qj(a, b) {
      b = pj({ mode: "visible", children: b }, a.mode, 0, null);
      b.return = a;
      return a.child = b;
    }
    function sj(a, b, c, d) {
      null !== d && Jg(d);
      Ug(b, a.child, null, c);
      a = qj(b, b.pendingProps.children);
      a.flags |= 2;
      b.memoizedState = null;
      return a;
    }
    function rj(a, b, c, d, e, f, g) {
      if (c) {
        if (b.flags & 256) return b.flags &= -257, d = Ki(Error(p(422))), sj(a, b, g, d);
        if (null !== b.memoizedState) return b.child = a.child, b.flags |= 128, null;
        f = d.fallback;
        e = b.mode;
        d = pj({ mode: "visible", children: d.children }, e, 0, null);
        f = Tg(f, e, g, null);
        f.flags |= 2;
        d.return = b;
        f.return = b;
        d.sibling = f;
        b.child = d;
        0 !== (b.mode & 1) && Ug(b, a.child, null, g);
        b.child.memoizedState = nj(g);
        b.memoizedState = mj;
        return f;
      }
      if (0 === (b.mode & 1)) return sj(a, b, g, null);
      if ("$!" === e.data) {
        d = e.nextSibling && e.nextSibling.dataset;
        if (d) var h = d.dgst;
        d = h;
        f = Error(p(419));
        d = Ki(f, d, void 0);
        return sj(a, b, g, d);
      }
      h = 0 !== (g & a.childLanes);
      if (dh || h) {
        d = Q;
        if (null !== d) {
          switch (g & -g) {
            case 4:
              e = 2;
              break;
            case 16:
              e = 8;
              break;
            case 64:
            case 128:
            case 256:
            case 512:
            case 1024:
            case 2048:
            case 4096:
            case 8192:
            case 16384:
            case 32768:
            case 65536:
            case 131072:
            case 262144:
            case 524288:
            case 1048576:
            case 2097152:
            case 4194304:
            case 8388608:
            case 16777216:
            case 33554432:
            case 67108864:
              e = 32;
              break;
            case 536870912:
              e = 268435456;
              break;
            default:
              e = 0;
          }
          e = 0 !== (e & (d.suspendedLanes | g)) ? 0 : e;
          0 !== e && e !== f.retryLane && (f.retryLane = e, ih(a, e), gi(d, a, e, -1));
        }
        tj();
        d = Ki(Error(p(421)));
        return sj(a, b, g, d);
      }
      if ("$?" === e.data) return b.flags |= 128, b.child = a.child, b = uj.bind(null, a), e._reactRetry = b, null;
      a = f.treeContext;
      yg = Lf(e.nextSibling);
      xg = b;
      I = true;
      zg = null;
      null !== a && (og[pg++] = rg, og[pg++] = sg, og[pg++] = qg, rg = a.id, sg = a.overflow, qg = b);
      b = qj(b, d.children);
      b.flags |= 4096;
      return b;
    }
    function vj(a, b, c) {
      a.lanes |= b;
      var d = a.alternate;
      null !== d && (d.lanes |= b);
      bh(a.return, b, c);
    }
    function wj(a, b, c, d, e) {
      var f = a.memoizedState;
      null === f ? a.memoizedState = { isBackwards: b, rendering: null, renderingStartTime: 0, last: d, tail: c, tailMode: e } : (f.isBackwards = b, f.rendering = null, f.renderingStartTime = 0, f.last = d, f.tail = c, f.tailMode = e);
    }
    function xj(a, b, c) {
      var d = b.pendingProps, e = d.revealOrder, f = d.tail;
      Xi(a, b, d.children, c);
      d = L.current;
      if (0 !== (d & 2)) d = d & 1 | 2, b.flags |= 128;
      else {
        if (null !== a && 0 !== (a.flags & 128)) a: for (a = b.child; null !== a; ) {
          if (13 === a.tag) null !== a.memoizedState && vj(a, c, b);
          else if (19 === a.tag) vj(a, c, b);
          else if (null !== a.child) {
            a.child.return = a;
            a = a.child;
            continue;
          }
          if (a === b) break a;
          for (; null === a.sibling; ) {
            if (null === a.return || a.return === b) break a;
            a = a.return;
          }
          a.sibling.return = a.return;
          a = a.sibling;
        }
        d &= 1;
      }
      G(L, d);
      if (0 === (b.mode & 1)) b.memoizedState = null;
      else switch (e) {
        case "forwards":
          c = b.child;
          for (e = null; null !== c; ) a = c.alternate, null !== a && null === Ch(a) && (e = c), c = c.sibling;
          c = e;
          null === c ? (e = b.child, b.child = null) : (e = c.sibling, c.sibling = null);
          wj(b, false, e, c, f);
          break;
        case "backwards":
          c = null;
          e = b.child;
          for (b.child = null; null !== e; ) {
            a = e.alternate;
            if (null !== a && null === Ch(a)) {
              b.child = e;
              break;
            }
            a = e.sibling;
            e.sibling = c;
            c = e;
            e = a;
          }
          wj(b, true, c, null, f);
          break;
        case "together":
          wj(b, false, null, null, void 0);
          break;
        default:
          b.memoizedState = null;
      }
      return b.child;
    }
    function ij(a, b) {
      0 === (b.mode & 1) && null !== a && (a.alternate = null, b.alternate = null, b.flags |= 2);
    }
    function Zi(a, b, c) {
      null !== a && (b.dependencies = a.dependencies);
      rh |= b.lanes;
      if (0 === (c & b.childLanes)) return null;
      if (null !== a && b.child !== a.child) throw Error(p(153));
      if (null !== b.child) {
        a = b.child;
        c = Pg(a, a.pendingProps);
        b.child = c;
        for (c.return = b; null !== a.sibling; ) a = a.sibling, c = c.sibling = Pg(a, a.pendingProps), c.return = b;
        c.sibling = null;
      }
      return b.child;
    }
    function yj(a, b, c) {
      switch (b.tag) {
        case 3:
          kj(b);
          Ig();
          break;
        case 5:
          Ah(b);
          break;
        case 1:
          Zf(b.type) && cg(b);
          break;
        case 4:
          yh(b, b.stateNode.containerInfo);
          break;
        case 10:
          var d = b.type._context, e = b.memoizedProps.value;
          G(Wg, d._currentValue);
          d._currentValue = e;
          break;
        case 13:
          d = b.memoizedState;
          if (null !== d) {
            if (null !== d.dehydrated) return G(L, L.current & 1), b.flags |= 128, null;
            if (0 !== (c & b.child.childLanes)) return oj(a, b, c);
            G(L, L.current & 1);
            a = Zi(a, b, c);
            return null !== a ? a.sibling : null;
          }
          G(L, L.current & 1);
          break;
        case 19:
          d = 0 !== (c & b.childLanes);
          if (0 !== (a.flags & 128)) {
            if (d) return xj(a, b, c);
            b.flags |= 128;
          }
          e = b.memoizedState;
          null !== e && (e.rendering = null, e.tail = null, e.lastEffect = null);
          G(L, L.current);
          if (d) break;
          else return null;
        case 22:
        case 23:
          return b.lanes = 0, dj(a, b, c);
      }
      return Zi(a, b, c);
    }
    var zj, Aj, Bj, Cj;
    zj = function(a, b) {
      for (var c = b.child; null !== c; ) {
        if (5 === c.tag || 6 === c.tag) a.appendChild(c.stateNode);
        else if (4 !== c.tag && null !== c.child) {
          c.child.return = c;
          c = c.child;
          continue;
        }
        if (c === b) break;
        for (; null === c.sibling; ) {
          if (null === c.return || c.return === b) return;
          c = c.return;
        }
        c.sibling.return = c.return;
        c = c.sibling;
      }
    };
    Aj = function() {
    };
    Bj = function(a, b, c, d) {
      var e = a.memoizedProps;
      if (e !== d) {
        a = b.stateNode;
        xh(uh.current);
        var f = null;
        switch (c) {
          case "input":
            e = Ya(a, e);
            d = Ya(a, d);
            f = [];
            break;
          case "select":
            e = A({}, e, { value: void 0 });
            d = A({}, d, { value: void 0 });
            f = [];
            break;
          case "textarea":
            e = gb(a, e);
            d = gb(a, d);
            f = [];
            break;
          default:
            "function" !== typeof e.onClick && "function" === typeof d.onClick && (a.onclick = Bf);
        }
        ub(c, d);
        var g;
        c = null;
        for (l in e) if (!d.hasOwnProperty(l) && e.hasOwnProperty(l) && null != e[l]) if ("style" === l) {
          var h = e[l];
          for (g in h) h.hasOwnProperty(g) && (c || (c = {}), c[g] = "");
        } else "dangerouslySetInnerHTML" !== l && "children" !== l && "suppressContentEditableWarning" !== l && "suppressHydrationWarning" !== l && "autoFocus" !== l && (ea.hasOwnProperty(l) ? f || (f = []) : (f = f || []).push(l, null));
        for (l in d) {
          var k = d[l];
          h = null != e ? e[l] : void 0;
          if (d.hasOwnProperty(l) && k !== h && (null != k || null != h)) if ("style" === l) if (h) {
            for (g in h) !h.hasOwnProperty(g) || k && k.hasOwnProperty(g) || (c || (c = {}), c[g] = "");
            for (g in k) k.hasOwnProperty(g) && h[g] !== k[g] && (c || (c = {}), c[g] = k[g]);
          } else c || (f || (f = []), f.push(
            l,
            c
          )), c = k;
          else "dangerouslySetInnerHTML" === l ? (k = k ? k.__html : void 0, h = h ? h.__html : void 0, null != k && h !== k && (f = f || []).push(l, k)) : "children" === l ? "string" !== typeof k && "number" !== typeof k || (f = f || []).push(l, "" + k) : "suppressContentEditableWarning" !== l && "suppressHydrationWarning" !== l && (ea.hasOwnProperty(l) ? (null != k && "onScroll" === l && D("scroll", a), f || h === k || (f = [])) : (f = f || []).push(l, k));
        }
        c && (f = f || []).push("style", c);
        var l = f;
        if (b.updateQueue = l) b.flags |= 4;
      }
    };
    Cj = function(a, b, c, d) {
      c !== d && (b.flags |= 4);
    };
    function Dj(a, b) {
      if (!I) switch (a.tailMode) {
        case "hidden":
          b = a.tail;
          for (var c = null; null !== b; ) null !== b.alternate && (c = b), b = b.sibling;
          null === c ? a.tail = null : c.sibling = null;
          break;
        case "collapsed":
          c = a.tail;
          for (var d = null; null !== c; ) null !== c.alternate && (d = c), c = c.sibling;
          null === d ? b || null === a.tail ? a.tail = null : a.tail.sibling = null : d.sibling = null;
      }
    }
    function S(a) {
      var b = null !== a.alternate && a.alternate.child === a.child, c = 0, d = 0;
      if (b) for (var e = a.child; null !== e; ) c |= e.lanes | e.childLanes, d |= e.subtreeFlags & 14680064, d |= e.flags & 14680064, e.return = a, e = e.sibling;
      else for (e = a.child; null !== e; ) c |= e.lanes | e.childLanes, d |= e.subtreeFlags, d |= e.flags, e.return = a, e = e.sibling;
      a.subtreeFlags |= d;
      a.childLanes = c;
      return b;
    }
    function Ej(a, b, c) {
      var d = b.pendingProps;
      wg(b);
      switch (b.tag) {
        case 2:
        case 16:
        case 15:
        case 0:
        case 11:
        case 7:
        case 8:
        case 12:
        case 9:
        case 14:
          return S(b), null;
        case 1:
          return Zf(b.type) && $f(), S(b), null;
        case 3:
          d = b.stateNode;
          zh();
          E(Wf);
          E(H);
          Eh();
          d.pendingContext && (d.context = d.pendingContext, d.pendingContext = null);
          if (null === a || null === a.child) Gg(b) ? b.flags |= 4 : null === a || a.memoizedState.isDehydrated && 0 === (b.flags & 256) || (b.flags |= 1024, null !== zg && (Fj(zg), zg = null));
          Aj(a, b);
          S(b);
          return null;
        case 5:
          Bh(b);
          var e = xh(wh.current);
          c = b.type;
          if (null !== a && null != b.stateNode) Bj(a, b, c, d, e), a.ref !== b.ref && (b.flags |= 512, b.flags |= 2097152);
          else {
            if (!d) {
              if (null === b.stateNode) throw Error(p(166));
              S(b);
              return null;
            }
            a = xh(uh.current);
            if (Gg(b)) {
              d = b.stateNode;
              c = b.type;
              var f = b.memoizedProps;
              d[Of] = b;
              d[Pf] = f;
              a = 0 !== (b.mode & 1);
              switch (c) {
                case "dialog":
                  D("cancel", d);
                  D("close", d);
                  break;
                case "iframe":
                case "object":
                case "embed":
                  D("load", d);
                  break;
                case "video":
                case "audio":
                  for (e = 0; e < lf.length; e++) D(lf[e], d);
                  break;
                case "source":
                  D("error", d);
                  break;
                case "img":
                case "image":
                case "link":
                  D(
                    "error",
                    d
                  );
                  D("load", d);
                  break;
                case "details":
                  D("toggle", d);
                  break;
                case "input":
                  Za(d, f);
                  D("invalid", d);
                  break;
                case "select":
                  d._wrapperState = { wasMultiple: !!f.multiple };
                  D("invalid", d);
                  break;
                case "textarea":
                  hb(d, f), D("invalid", d);
              }
              ub(c, f);
              e = null;
              for (var g in f) if (f.hasOwnProperty(g)) {
                var h = f[g];
                "children" === g ? "string" === typeof h ? d.textContent !== h && (true !== f.suppressHydrationWarning && Af(d.textContent, h, a), e = ["children", h]) : "number" === typeof h && d.textContent !== "" + h && (true !== f.suppressHydrationWarning && Af(
                  d.textContent,
                  h,
                  a
                ), e = ["children", "" + h]) : ea.hasOwnProperty(g) && null != h && "onScroll" === g && D("scroll", d);
              }
              switch (c) {
                case "input":
                  Va(d);
                  db(d, f, true);
                  break;
                case "textarea":
                  Va(d);
                  jb(d);
                  break;
                case "select":
                case "option":
                  break;
                default:
                  "function" === typeof f.onClick && (d.onclick = Bf);
              }
              d = e;
              b.updateQueue = d;
              null !== d && (b.flags |= 4);
            } else {
              g = 9 === e.nodeType ? e : e.ownerDocument;
              "http://www.w3.org/1999/xhtml" === a && (a = kb(c));
              "http://www.w3.org/1999/xhtml" === a ? "script" === c ? (a = g.createElement("div"), a.innerHTML = "<script><\/script>", a = a.removeChild(a.firstChild)) : "string" === typeof d.is ? a = g.createElement(c, { is: d.is }) : (a = g.createElement(c), "select" === c && (g = a, d.multiple ? g.multiple = true : d.size && (g.size = d.size))) : a = g.createElementNS(a, c);
              a[Of] = b;
              a[Pf] = d;
              zj(a, b, false, false);
              b.stateNode = a;
              a: {
                g = vb(c, d);
                switch (c) {
                  case "dialog":
                    D("cancel", a);
                    D("close", a);
                    e = d;
                    break;
                  case "iframe":
                  case "object":
                  case "embed":
                    D("load", a);
                    e = d;
                    break;
                  case "video":
                  case "audio":
                    for (e = 0; e < lf.length; e++) D(lf[e], a);
                    e = d;
                    break;
                  case "source":
                    D("error", a);
                    e = d;
                    break;
                  case "img":
                  case "image":
                  case "link":
                    D(
                      "error",
                      a
                    );
                    D("load", a);
                    e = d;
                    break;
                  case "details":
                    D("toggle", a);
                    e = d;
                    break;
                  case "input":
                    Za(a, d);
                    e = Ya(a, d);
                    D("invalid", a);
                    break;
                  case "option":
                    e = d;
                    break;
                  case "select":
                    a._wrapperState = { wasMultiple: !!d.multiple };
                    e = A({}, d, { value: void 0 });
                    D("invalid", a);
                    break;
                  case "textarea":
                    hb(a, d);
                    e = gb(a, d);
                    D("invalid", a);
                    break;
                  default:
                    e = d;
                }
                ub(c, e);
                h = e;
                for (f in h) if (h.hasOwnProperty(f)) {
                  var k = h[f];
                  "style" === f ? sb(a, k) : "dangerouslySetInnerHTML" === f ? (k = k ? k.__html : void 0, null != k && nb(a, k)) : "children" === f ? "string" === typeof k ? ("textarea" !== c || "" !== k) && ob(a, k) : "number" === typeof k && ob(a, "" + k) : "suppressContentEditableWarning" !== f && "suppressHydrationWarning" !== f && "autoFocus" !== f && (ea.hasOwnProperty(f) ? null != k && "onScroll" === f && D("scroll", a) : null != k && ta(a, f, k, g));
                }
                switch (c) {
                  case "input":
                    Va(a);
                    db(a, d, false);
                    break;
                  case "textarea":
                    Va(a);
                    jb(a);
                    break;
                  case "option":
                    null != d.value && a.setAttribute("value", "" + Sa(d.value));
                    break;
                  case "select":
                    a.multiple = !!d.multiple;
                    f = d.value;
                    null != f ? fb(a, !!d.multiple, f, false) : null != d.defaultValue && fb(
                      a,
                      !!d.multiple,
                      d.defaultValue,
                      true
                    );
                    break;
                  default:
                    "function" === typeof e.onClick && (a.onclick = Bf);
                }
                switch (c) {
                  case "button":
                  case "input":
                  case "select":
                  case "textarea":
                    d = !!d.autoFocus;
                    break a;
                  case "img":
                    d = true;
                    break a;
                  default:
                    d = false;
                }
              }
              d && (b.flags |= 4);
            }
            null !== b.ref && (b.flags |= 512, b.flags |= 2097152);
          }
          S(b);
          return null;
        case 6:
          if (a && null != b.stateNode) Cj(a, b, a.memoizedProps, d);
          else {
            if ("string" !== typeof d && null === b.stateNode) throw Error(p(166));
            c = xh(wh.current);
            xh(uh.current);
            if (Gg(b)) {
              d = b.stateNode;
              c = b.memoizedProps;
              d[Of] = b;
              if (f = d.nodeValue !== c) {
                if (a = xg, null !== a) switch (a.tag) {
                  case 3:
                    Af(d.nodeValue, c, 0 !== (a.mode & 1));
                    break;
                  case 5:
                    true !== a.memoizedProps.suppressHydrationWarning && Af(d.nodeValue, c, 0 !== (a.mode & 1));
                }
              }
              f && (b.flags |= 4);
            } else d = (9 === c.nodeType ? c : c.ownerDocument).createTextNode(d), d[Of] = b, b.stateNode = d;
          }
          S(b);
          return null;
        case 13:
          E(L);
          d = b.memoizedState;
          if (null === a || null !== a.memoizedState && null !== a.memoizedState.dehydrated) {
            if (I && null !== yg && 0 !== (b.mode & 1) && 0 === (b.flags & 128)) Hg(), Ig(), b.flags |= 98560, f = false;
            else if (f = Gg(b), null !== d && null !== d.dehydrated) {
              if (null === a) {
                if (!f) throw Error(p(318));
                f = b.memoizedState;
                f = null !== f ? f.dehydrated : null;
                if (!f) throw Error(p(317));
                f[Of] = b;
              } else Ig(), 0 === (b.flags & 128) && (b.memoizedState = null), b.flags |= 4;
              S(b);
              f = false;
            } else null !== zg && (Fj(zg), zg = null), f = true;
            if (!f) return b.flags & 65536 ? b : null;
          }
          if (0 !== (b.flags & 128)) return b.lanes = c, b;
          d = null !== d;
          d !== (null !== a && null !== a.memoizedState) && d && (b.child.flags |= 8192, 0 !== (b.mode & 1) && (null === a || 0 !== (L.current & 1) ? 0 === T && (T = 3) : tj()));
          null !== b.updateQueue && (b.flags |= 4);
          S(b);
          return null;
        case 4:
          return zh(), Aj(a, b), null === a && sf(b.stateNode.containerInfo), S(b), null;
        case 10:
          return ah(b.type._context), S(b), null;
        case 17:
          return Zf(b.type) && $f(), S(b), null;
        case 19:
          E(L);
          f = b.memoizedState;
          if (null === f) return S(b), null;
          d = 0 !== (b.flags & 128);
          g = f.rendering;
          if (null === g) if (d) Dj(f, false);
          else {
            if (0 !== T || null !== a && 0 !== (a.flags & 128)) for (a = b.child; null !== a; ) {
              g = Ch(a);
              if (null !== g) {
                b.flags |= 128;
                Dj(f, false);
                d = g.updateQueue;
                null !== d && (b.updateQueue = d, b.flags |= 4);
                b.subtreeFlags = 0;
                d = c;
                for (c = b.child; null !== c; ) f = c, a = d, f.flags &= 14680066, g = f.alternate, null === g ? (f.childLanes = 0, f.lanes = a, f.child = null, f.subtreeFlags = 0, f.memoizedProps = null, f.memoizedState = null, f.updateQueue = null, f.dependencies = null, f.stateNode = null) : (f.childLanes = g.childLanes, f.lanes = g.lanes, f.child = g.child, f.subtreeFlags = 0, f.deletions = null, f.memoizedProps = g.memoizedProps, f.memoizedState = g.memoizedState, f.updateQueue = g.updateQueue, f.type = g.type, a = g.dependencies, f.dependencies = null === a ? null : { lanes: a.lanes, firstContext: a.firstContext }), c = c.sibling;
                G(L, L.current & 1 | 2);
                return b.child;
              }
              a = a.sibling;
            }
            null !== f.tail && B() > Gj && (b.flags |= 128, d = true, Dj(f, false), b.lanes = 4194304);
          }
          else {
            if (!d) if (a = Ch(g), null !== a) {
              if (b.flags |= 128, d = true, c = a.updateQueue, null !== c && (b.updateQueue = c, b.flags |= 4), Dj(f, true), null === f.tail && "hidden" === f.tailMode && !g.alternate && !I) return S(b), null;
            } else 2 * B() - f.renderingStartTime > Gj && 1073741824 !== c && (b.flags |= 128, d = true, Dj(f, false), b.lanes = 4194304);
            f.isBackwards ? (g.sibling = b.child, b.child = g) : (c = f.last, null !== c ? c.sibling = g : b.child = g, f.last = g);
          }
          if (null !== f.tail) return b = f.tail, f.rendering = b, f.tail = b.sibling, f.renderingStartTime = B(), b.sibling = null, c = L.current, G(L, d ? c & 1 | 2 : c & 1), b;
          S(b);
          return null;
        case 22:
        case 23:
          return Hj(), d = null !== b.memoizedState, null !== a && null !== a.memoizedState !== d && (b.flags |= 8192), d && 0 !== (b.mode & 1) ? 0 !== (fj & 1073741824) && (S(b), b.subtreeFlags & 6 && (b.flags |= 8192)) : S(b), null;
        case 24:
          return null;
        case 25:
          return null;
      }
      throw Error(p(156, b.tag));
    }
    function Ij(a, b) {
      wg(b);
      switch (b.tag) {
        case 1:
          return Zf(b.type) && $f(), a = b.flags, a & 65536 ? (b.flags = a & -65537 | 128, b) : null;
        case 3:
          return zh(), E(Wf), E(H), Eh(), a = b.flags, 0 !== (a & 65536) && 0 === (a & 128) ? (b.flags = a & -65537 | 128, b) : null;
        case 5:
          return Bh(b), null;
        case 13:
          E(L);
          a = b.memoizedState;
          if (null !== a && null !== a.dehydrated) {
            if (null === b.alternate) throw Error(p(340));
            Ig();
          }
          a = b.flags;
          return a & 65536 ? (b.flags = a & -65537 | 128, b) : null;
        case 19:
          return E(L), null;
        case 4:
          return zh(), null;
        case 10:
          return ah(b.type._context), null;
        case 22:
        case 23:
          return Hj(), null;
        case 24:
          return null;
        default:
          return null;
      }
    }
    var Jj = false, U = false, Kj = "function" === typeof WeakSet ? WeakSet : Set, V = null;
    function Lj(a, b) {
      var c = a.ref;
      if (null !== c) if ("function" === typeof c) try {
        c(null);
      } catch (d) {
        W(a, b, d);
      }
      else c.current = null;
    }
    function Mj(a, b, c) {
      try {
        c();
      } catch (d) {
        W(a, b, d);
      }
    }
    var Nj = false;
    function Oj(a, b) {
      Cf = dd;
      a = Me();
      if (Ne(a)) {
        if ("selectionStart" in a) var c = { start: a.selectionStart, end: a.selectionEnd };
        else a: {
          c = (c = a.ownerDocument) && c.defaultView || window;
          var d = c.getSelection && c.getSelection();
          if (d && 0 !== d.rangeCount) {
            c = d.anchorNode;
            var e = d.anchorOffset, f = d.focusNode;
            d = d.focusOffset;
            try {
              c.nodeType, f.nodeType;
            } catch (F) {
              c = null;
              break a;
            }
            var g = 0, h = -1, k = -1, l = 0, m = 0, q = a, r2 = null;
            b: for (; ; ) {
              for (var y; ; ) {
                q !== c || 0 !== e && 3 !== q.nodeType || (h = g + e);
                q !== f || 0 !== d && 3 !== q.nodeType || (k = g + d);
                3 === q.nodeType && (g += q.nodeValue.length);
                if (null === (y = q.firstChild)) break;
                r2 = q;
                q = y;
              }
              for (; ; ) {
                if (q === a) break b;
                r2 === c && ++l === e && (h = g);
                r2 === f && ++m === d && (k = g);
                if (null !== (y = q.nextSibling)) break;
                q = r2;
                r2 = q.parentNode;
              }
              q = y;
            }
            c = -1 === h || -1 === k ? null : { start: h, end: k };
          } else c = null;
        }
        c = c || { start: 0, end: 0 };
      } else c = null;
      Df = { focusedElem: a, selectionRange: c };
      dd = false;
      for (V = b; null !== V; ) if (b = V, a = b.child, 0 !== (b.subtreeFlags & 1028) && null !== a) a.return = b, V = a;
      else for (; null !== V; ) {
        b = V;
        try {
          var n = b.alternate;
          if (0 !== (b.flags & 1024)) switch (b.tag) {
            case 0:
            case 11:
            case 15:
              break;
            case 1:
              if (null !== n) {
                var t = n.memoizedProps, J = n.memoizedState, x = b.stateNode, w = x.getSnapshotBeforeUpdate(b.elementType === b.type ? t : Ci(b.type, t), J);
                x.__reactInternalSnapshotBeforeUpdate = w;
              }
              break;
            case 3:
              var u = b.stateNode.containerInfo;
              1 === u.nodeType ? u.textContent = "" : 9 === u.nodeType && u.documentElement && u.removeChild(u.documentElement);
              break;
            case 5:
            case 6:
            case 4:
            case 17:
              break;
            default:
              throw Error(p(163));
          }
        } catch (F) {
          W(b, b.return, F);
        }
        a = b.sibling;
        if (null !== a) {
          a.return = b.return;
          V = a;
          break;
        }
        V = b.return;
      }
      n = Nj;
      Nj = false;
      return n;
    }
    function Pj(a, b, c) {
      var d = b.updateQueue;
      d = null !== d ? d.lastEffect : null;
      if (null !== d) {
        var e = d = d.next;
        do {
          if ((e.tag & a) === a) {
            var f = e.destroy;
            e.destroy = void 0;
            void 0 !== f && Mj(b, c, f);
          }
          e = e.next;
        } while (e !== d);
      }
    }
    function Qj(a, b) {
      b = b.updateQueue;
      b = null !== b ? b.lastEffect : null;
      if (null !== b) {
        var c = b = b.next;
        do {
          if ((c.tag & a) === a) {
            var d = c.create;
            c.destroy = d();
          }
          c = c.next;
        } while (c !== b);
      }
    }
    function Rj(a) {
      var b = a.ref;
      if (null !== b) {
        var c = a.stateNode;
        switch (a.tag) {
          case 5:
            a = c;
            break;
          default:
            a = c;
        }
        "function" === typeof b ? b(a) : b.current = a;
      }
    }
    function Sj(a) {
      var b = a.alternate;
      null !== b && (a.alternate = null, Sj(b));
      a.child = null;
      a.deletions = null;
      a.sibling = null;
      5 === a.tag && (b = a.stateNode, null !== b && (delete b[Of], delete b[Pf], delete b[of], delete b[Qf], delete b[Rf]));
      a.stateNode = null;
      a.return = null;
      a.dependencies = null;
      a.memoizedProps = null;
      a.memoizedState = null;
      a.pendingProps = null;
      a.stateNode = null;
      a.updateQueue = null;
    }
    function Tj(a) {
      return 5 === a.tag || 3 === a.tag || 4 === a.tag;
    }
    function Uj(a) {
      a: for (; ; ) {
        for (; null === a.sibling; ) {
          if (null === a.return || Tj(a.return)) return null;
          a = a.return;
        }
        a.sibling.return = a.return;
        for (a = a.sibling; 5 !== a.tag && 6 !== a.tag && 18 !== a.tag; ) {
          if (a.flags & 2) continue a;
          if (null === a.child || 4 === a.tag) continue a;
          else a.child.return = a, a = a.child;
        }
        if (!(a.flags & 2)) return a.stateNode;
      }
    }
    function Vj(a, b, c) {
      var d = a.tag;
      if (5 === d || 6 === d) a = a.stateNode, b ? 8 === c.nodeType ? c.parentNode.insertBefore(a, b) : c.insertBefore(a, b) : (8 === c.nodeType ? (b = c.parentNode, b.insertBefore(a, c)) : (b = c, b.appendChild(a)), c = c._reactRootContainer, null !== c && void 0 !== c || null !== b.onclick || (b.onclick = Bf));
      else if (4 !== d && (a = a.child, null !== a)) for (Vj(a, b, c), a = a.sibling; null !== a; ) Vj(a, b, c), a = a.sibling;
    }
    function Wj(a, b, c) {
      var d = a.tag;
      if (5 === d || 6 === d) a = a.stateNode, b ? c.insertBefore(a, b) : c.appendChild(a);
      else if (4 !== d && (a = a.child, null !== a)) for (Wj(a, b, c), a = a.sibling; null !== a; ) Wj(a, b, c), a = a.sibling;
    }
    var X = null, Xj = false;
    function Yj(a, b, c) {
      for (c = c.child; null !== c; ) Zj(a, b, c), c = c.sibling;
    }
    function Zj(a, b, c) {
      if (lc && "function" === typeof lc.onCommitFiberUnmount) try {
        lc.onCommitFiberUnmount(kc, c);
      } catch (h) {
      }
      switch (c.tag) {
        case 5:
          U || Lj(c, b);
        case 6:
          var d = X, e = Xj;
          X = null;
          Yj(a, b, c);
          X = d;
          Xj = e;
          null !== X && (Xj ? (a = X, c = c.stateNode, 8 === a.nodeType ? a.parentNode.removeChild(c) : a.removeChild(c)) : X.removeChild(c.stateNode));
          break;
        case 18:
          null !== X && (Xj ? (a = X, c = c.stateNode, 8 === a.nodeType ? Kf(a.parentNode, c) : 1 === a.nodeType && Kf(a, c), bd(a)) : Kf(X, c.stateNode));
          break;
        case 4:
          d = X;
          e = Xj;
          X = c.stateNode.containerInfo;
          Xj = true;
          Yj(a, b, c);
          X = d;
          Xj = e;
          break;
        case 0:
        case 11:
        case 14:
        case 15:
          if (!U && (d = c.updateQueue, null !== d && (d = d.lastEffect, null !== d))) {
            e = d = d.next;
            do {
              var f = e, g = f.destroy;
              f = f.tag;
              void 0 !== g && (0 !== (f & 2) ? Mj(c, b, g) : 0 !== (f & 4) && Mj(c, b, g));
              e = e.next;
            } while (e !== d);
          }
          Yj(a, b, c);
          break;
        case 1:
          if (!U && (Lj(c, b), d = c.stateNode, "function" === typeof d.componentWillUnmount)) try {
            d.props = c.memoizedProps, d.state = c.memoizedState, d.componentWillUnmount();
          } catch (h) {
            W(c, b, h);
          }
          Yj(a, b, c);
          break;
        case 21:
          Yj(a, b, c);
          break;
        case 22:
          c.mode & 1 ? (U = (d = U) || null !== c.memoizedState, Yj(a, b, c), U = d) : Yj(a, b, c);
          break;
        default:
          Yj(a, b, c);
      }
    }
    function ak(a) {
      var b = a.updateQueue;
      if (null !== b) {
        a.updateQueue = null;
        var c = a.stateNode;
        null === c && (c = a.stateNode = new Kj());
        b.forEach(function(b2) {
          var d = bk.bind(null, a, b2);
          c.has(b2) || (c.add(b2), b2.then(d, d));
        });
      }
    }
    function ck(a, b) {
      var c = b.deletions;
      if (null !== c) for (var d = 0; d < c.length; d++) {
        var e = c[d];
        try {
          var f = a, g = b, h = g;
          a: for (; null !== h; ) {
            switch (h.tag) {
              case 5:
                X = h.stateNode;
                Xj = false;
                break a;
              case 3:
                X = h.stateNode.containerInfo;
                Xj = true;
                break a;
              case 4:
                X = h.stateNode.containerInfo;
                Xj = true;
                break a;
            }
            h = h.return;
          }
          if (null === X) throw Error(p(160));
          Zj(f, g, e);
          X = null;
          Xj = false;
          var k = e.alternate;
          null !== k && (k.return = null);
          e.return = null;
        } catch (l) {
          W(e, b, l);
        }
      }
      if (b.subtreeFlags & 12854) for (b = b.child; null !== b; ) dk(b, a), b = b.sibling;
    }
    function dk(a, b) {
      var c = a.alternate, d = a.flags;
      switch (a.tag) {
        case 0:
        case 11:
        case 14:
        case 15:
          ck(b, a);
          ek(a);
          if (d & 4) {
            try {
              Pj(3, a, a.return), Qj(3, a);
            } catch (t) {
              W(a, a.return, t);
            }
            try {
              Pj(5, a, a.return);
            } catch (t) {
              W(a, a.return, t);
            }
          }
          break;
        case 1:
          ck(b, a);
          ek(a);
          d & 512 && null !== c && Lj(c, c.return);
          break;
        case 5:
          ck(b, a);
          ek(a);
          d & 512 && null !== c && Lj(c, c.return);
          if (a.flags & 32) {
            var e = a.stateNode;
            try {
              ob(e, "");
            } catch (t) {
              W(a, a.return, t);
            }
          }
          if (d & 4 && (e = a.stateNode, null != e)) {
            var f = a.memoizedProps, g = null !== c ? c.memoizedProps : f, h = a.type, k = a.updateQueue;
            a.updateQueue = null;
            if (null !== k) try {
              "input" === h && "radio" === f.type && null != f.name && ab(e, f);
              vb(h, g);
              var l = vb(h, f);
              for (g = 0; g < k.length; g += 2) {
                var m = k[g], q = k[g + 1];
                "style" === m ? sb(e, q) : "dangerouslySetInnerHTML" === m ? nb(e, q) : "children" === m ? ob(e, q) : ta(e, m, q, l);
              }
              switch (h) {
                case "input":
                  bb(e, f);
                  break;
                case "textarea":
                  ib(e, f);
                  break;
                case "select":
                  var r2 = e._wrapperState.wasMultiple;
                  e._wrapperState.wasMultiple = !!f.multiple;
                  var y = f.value;
                  null != y ? fb(e, !!f.multiple, y, false) : r2 !== !!f.multiple && (null != f.defaultValue ? fb(
                    e,
                    !!f.multiple,
                    f.defaultValue,
                    true
                  ) : fb(e, !!f.multiple, f.multiple ? [] : "", false));
              }
              e[Pf] = f;
            } catch (t) {
              W(a, a.return, t);
            }
          }
          break;
        case 6:
          ck(b, a);
          ek(a);
          if (d & 4) {
            if (null === a.stateNode) throw Error(p(162));
            e = a.stateNode;
            f = a.memoizedProps;
            try {
              e.nodeValue = f;
            } catch (t) {
              W(a, a.return, t);
            }
          }
          break;
        case 3:
          ck(b, a);
          ek(a);
          if (d & 4 && null !== c && c.memoizedState.isDehydrated) try {
            bd(b.containerInfo);
          } catch (t) {
            W(a, a.return, t);
          }
          break;
        case 4:
          ck(b, a);
          ek(a);
          break;
        case 13:
          ck(b, a);
          ek(a);
          e = a.child;
          e.flags & 8192 && (f = null !== e.memoizedState, e.stateNode.isHidden = f, !f || null !== e.alternate && null !== e.alternate.memoizedState || (fk = B()));
          d & 4 && ak(a);
          break;
        case 22:
          m = null !== c && null !== c.memoizedState;
          a.mode & 1 ? (U = (l = U) || m, ck(b, a), U = l) : ck(b, a);
          ek(a);
          if (d & 8192) {
            l = null !== a.memoizedState;
            if ((a.stateNode.isHidden = l) && !m && 0 !== (a.mode & 1)) for (V = a, m = a.child; null !== m; ) {
              for (q = V = m; null !== V; ) {
                r2 = V;
                y = r2.child;
                switch (r2.tag) {
                  case 0:
                  case 11:
                  case 14:
                  case 15:
                    Pj(4, r2, r2.return);
                    break;
                  case 1:
                    Lj(r2, r2.return);
                    var n = r2.stateNode;
                    if ("function" === typeof n.componentWillUnmount) {
                      d = r2;
                      c = r2.return;
                      try {
                        b = d, n.props = b.memoizedProps, n.state = b.memoizedState, n.componentWillUnmount();
                      } catch (t) {
                        W(d, c, t);
                      }
                    }
                    break;
                  case 5:
                    Lj(r2, r2.return);
                    break;
                  case 22:
                    if (null !== r2.memoizedState) {
                      gk(q);
                      continue;
                    }
                }
                null !== y ? (y.return = r2, V = y) : gk(q);
              }
              m = m.sibling;
            }
            a: for (m = null, q = a; ; ) {
              if (5 === q.tag) {
                if (null === m) {
                  m = q;
                  try {
                    e = q.stateNode, l ? (f = e.style, "function" === typeof f.setProperty ? f.setProperty("display", "none", "important") : f.display = "none") : (h = q.stateNode, k = q.memoizedProps.style, g = void 0 !== k && null !== k && k.hasOwnProperty("display") ? k.display : null, h.style.display = rb("display", g));
                  } catch (t) {
                    W(a, a.return, t);
                  }
                }
              } else if (6 === q.tag) {
                if (null === m) try {
                  q.stateNode.nodeValue = l ? "" : q.memoizedProps;
                } catch (t) {
                  W(a, a.return, t);
                }
              } else if ((22 !== q.tag && 23 !== q.tag || null === q.memoizedState || q === a) && null !== q.child) {
                q.child.return = q;
                q = q.child;
                continue;
              }
              if (q === a) break a;
              for (; null === q.sibling; ) {
                if (null === q.return || q.return === a) break a;
                m === q && (m = null);
                q = q.return;
              }
              m === q && (m = null);
              q.sibling.return = q.return;
              q = q.sibling;
            }
          }
          break;
        case 19:
          ck(b, a);
          ek(a);
          d & 4 && ak(a);
          break;
        case 21:
          break;
        default:
          ck(
            b,
            a
          ), ek(a);
      }
    }
    function ek(a) {
      var b = a.flags;
      if (b & 2) {
        try {
          a: {
            for (var c = a.return; null !== c; ) {
              if (Tj(c)) {
                var d = c;
                break a;
              }
              c = c.return;
            }
            throw Error(p(160));
          }
          switch (d.tag) {
            case 5:
              var e = d.stateNode;
              d.flags & 32 && (ob(e, ""), d.flags &= -33);
              var f = Uj(a);
              Wj(a, f, e);
              break;
            case 3:
            case 4:
              var g = d.stateNode.containerInfo, h = Uj(a);
              Vj(a, h, g);
              break;
            default:
              throw Error(p(161));
          }
        } catch (k) {
          W(a, a.return, k);
        }
        a.flags &= -3;
      }
      b & 4096 && (a.flags &= -4097);
    }
    function hk(a, b, c) {
      V = a;
      ik(a);
    }
    function ik(a, b, c) {
      for (var d = 0 !== (a.mode & 1); null !== V; ) {
        var e = V, f = e.child;
        if (22 === e.tag && d) {
          var g = null !== e.memoizedState || Jj;
          if (!g) {
            var h = e.alternate, k = null !== h && null !== h.memoizedState || U;
            h = Jj;
            var l = U;
            Jj = g;
            if ((U = k) && !l) for (V = e; null !== V; ) g = V, k = g.child, 22 === g.tag && null !== g.memoizedState ? jk(e) : null !== k ? (k.return = g, V = k) : jk(e);
            for (; null !== f; ) V = f, ik(f), f = f.sibling;
            V = e;
            Jj = h;
            U = l;
          }
          kk(a);
        } else 0 !== (e.subtreeFlags & 8772) && null !== f ? (f.return = e, V = f) : kk(a);
      }
    }
    function kk(a) {
      for (; null !== V; ) {
        var b = V;
        if (0 !== (b.flags & 8772)) {
          var c = b.alternate;
          try {
            if (0 !== (b.flags & 8772)) switch (b.tag) {
              case 0:
              case 11:
              case 15:
                U || Qj(5, b);
                break;
              case 1:
                var d = b.stateNode;
                if (b.flags & 4 && !U) if (null === c) d.componentDidMount();
                else {
                  var e = b.elementType === b.type ? c.memoizedProps : Ci(b.type, c.memoizedProps);
                  d.componentDidUpdate(e, c.memoizedState, d.__reactInternalSnapshotBeforeUpdate);
                }
                var f = b.updateQueue;
                null !== f && sh(b, f, d);
                break;
              case 3:
                var g = b.updateQueue;
                if (null !== g) {
                  c = null;
                  if (null !== b.child) switch (b.child.tag) {
                    case 5:
                      c = b.child.stateNode;
                      break;
                    case 1:
                      c = b.child.stateNode;
                  }
                  sh(b, g, c);
                }
                break;
              case 5:
                var h = b.stateNode;
                if (null === c && b.flags & 4) {
                  c = h;
                  var k = b.memoizedProps;
                  switch (b.type) {
                    case "button":
                    case "input":
                    case "select":
                    case "textarea":
                      k.autoFocus && c.focus();
                      break;
                    case "img":
                      k.src && (c.src = k.src);
                  }
                }
                break;
              case 6:
                break;
              case 4:
                break;
              case 12:
                break;
              case 13:
                if (null === b.memoizedState) {
                  var l = b.alternate;
                  if (null !== l) {
                    var m = l.memoizedState;
                    if (null !== m) {
                      var q = m.dehydrated;
                      null !== q && bd(q);
                    }
                  }
                }
                break;
              case 19:
              case 17:
              case 21:
              case 22:
              case 23:
              case 25:
                break;
              default:
                throw Error(p(163));
            }
            U || b.flags & 512 && Rj(b);
          } catch (r2) {
            W(b, b.return, r2);
          }
        }
        if (b === a) {
          V = null;
          break;
        }
        c = b.sibling;
        if (null !== c) {
          c.return = b.return;
          V = c;
          break;
        }
        V = b.return;
      }
    }
    function gk(a) {
      for (; null !== V; ) {
        var b = V;
        if (b === a) {
          V = null;
          break;
        }
        var c = b.sibling;
        if (null !== c) {
          c.return = b.return;
          V = c;
          break;
        }
        V = b.return;
      }
    }
    function jk(a) {
      for (; null !== V; ) {
        var b = V;
        try {
          switch (b.tag) {
            case 0:
            case 11:
            case 15:
              var c = b.return;
              try {
                Qj(4, b);
              } catch (k) {
                W(b, c, k);
              }
              break;
            case 1:
              var d = b.stateNode;
              if ("function" === typeof d.componentDidMount) {
                var e = b.return;
                try {
                  d.componentDidMount();
                } catch (k) {
                  W(b, e, k);
                }
              }
              var f = b.return;
              try {
                Rj(b);
              } catch (k) {
                W(b, f, k);
              }
              break;
            case 5:
              var g = b.return;
              try {
                Rj(b);
              } catch (k) {
                W(b, g, k);
              }
          }
        } catch (k) {
          W(b, b.return, k);
        }
        if (b === a) {
          V = null;
          break;
        }
        var h = b.sibling;
        if (null !== h) {
          h.return = b.return;
          V = h;
          break;
        }
        V = b.return;
      }
    }
    var lk = Math.ceil, mk = ua.ReactCurrentDispatcher, nk = ua.ReactCurrentOwner, ok = ua.ReactCurrentBatchConfig, K = 0, Q = null, Y = null, Z = 0, fj = 0, ej = Uf(0), T = 0, pk = null, rh = 0, qk = 0, rk = 0, sk = null, tk = null, fk = 0, Gj = Infinity, uk = null, Oi = false, Pi = null, Ri = null, vk = false, wk = null, xk = 0, yk = 0, zk = null, Ak = -1, Bk = 0;
    function R() {
      return 0 !== (K & 6) ? B() : -1 !== Ak ? Ak : Ak = B();
    }
    function yi(a) {
      if (0 === (a.mode & 1)) return 1;
      if (0 !== (K & 2) && 0 !== Z) return Z & -Z;
      if (null !== Kg.transition) return 0 === Bk && (Bk = yc()), Bk;
      a = C;
      if (0 !== a) return a;
      a = window.event;
      a = void 0 === a ? 16 : jd(a.type);
      return a;
    }
    function gi(a, b, c, d) {
      if (50 < yk) throw yk = 0, zk = null, Error(p(185));
      Ac(a, c, d);
      if (0 === (K & 2) || a !== Q) a === Q && (0 === (K & 2) && (qk |= c), 4 === T && Ck(a, Z)), Dk(a, d), 1 === c && 0 === K && 0 === (b.mode & 1) && (Gj = B() + 500, fg && jg());
    }
    function Dk(a, b) {
      var c = a.callbackNode;
      wc(a, b);
      var d = uc(a, a === Q ? Z : 0);
      if (0 === d) null !== c && bc(c), a.callbackNode = null, a.callbackPriority = 0;
      else if (b = d & -d, a.callbackPriority !== b) {
        null != c && bc(c);
        if (1 === b) 0 === a.tag ? ig(Ek.bind(null, a)) : hg(Ek.bind(null, a)), Jf(function() {
          0 === (K & 6) && jg();
        }), c = null;
        else {
          switch (Dc(d)) {
            case 1:
              c = fc;
              break;
            case 4:
              c = gc;
              break;
            case 16:
              c = hc;
              break;
            case 536870912:
              c = jc;
              break;
            default:
              c = hc;
          }
          c = Fk(c, Gk.bind(null, a));
        }
        a.callbackPriority = b;
        a.callbackNode = c;
      }
    }
    function Gk(a, b) {
      Ak = -1;
      Bk = 0;
      if (0 !== (K & 6)) throw Error(p(327));
      var c = a.callbackNode;
      if (Hk() && a.callbackNode !== c) return null;
      var d = uc(a, a === Q ? Z : 0);
      if (0 === d) return null;
      if (0 !== (d & 30) || 0 !== (d & a.expiredLanes) || b) b = Ik(a, d);
      else {
        b = d;
        var e = K;
        K |= 2;
        var f = Jk();
        if (Q !== a || Z !== b) uk = null, Gj = B() + 500, Kk(a, b);
        do
          try {
            Lk();
            break;
          } catch (h) {
            Mk(a, h);
          }
        while (1);
        $g();
        mk.current = f;
        K = e;
        null !== Y ? b = 0 : (Q = null, Z = 0, b = T);
      }
      if (0 !== b) {
        2 === b && (e = xc(a), 0 !== e && (d = e, b = Nk(a, e)));
        if (1 === b) throw c = pk, Kk(a, 0), Ck(a, d), Dk(a, B()), c;
        if (6 === b) Ck(a, d);
        else {
          e = a.current.alternate;
          if (0 === (d & 30) && !Ok(e) && (b = Ik(a, d), 2 === b && (f = xc(a), 0 !== f && (d = f, b = Nk(a, f))), 1 === b)) throw c = pk, Kk(a, 0), Ck(a, d), Dk(a, B()), c;
          a.finishedWork = e;
          a.finishedLanes = d;
          switch (b) {
            case 0:
            case 1:
              throw Error(p(345));
            case 2:
              Pk(a, tk, uk);
              break;
            case 3:
              Ck(a, d);
              if ((d & 130023424) === d && (b = fk + 500 - B(), 10 < b)) {
                if (0 !== uc(a, 0)) break;
                e = a.suspendedLanes;
                if ((e & d) !== d) {
                  R();
                  a.pingedLanes |= a.suspendedLanes & e;
                  break;
                }
                a.timeoutHandle = Ff(Pk.bind(null, a, tk, uk), b);
                break;
              }
              Pk(a, tk, uk);
              break;
            case 4:
              Ck(a, d);
              if ((d & 4194240) === d) break;
              b = a.eventTimes;
              for (e = -1; 0 < d; ) {
                var g = 31 - oc(d);
                f = 1 << g;
                g = b[g];
                g > e && (e = g);
                d &= ~f;
              }
              d = e;
              d = B() - d;
              d = (120 > d ? 120 : 480 > d ? 480 : 1080 > d ? 1080 : 1920 > d ? 1920 : 3e3 > d ? 3e3 : 4320 > d ? 4320 : 1960 * lk(d / 1960)) - d;
              if (10 < d) {
                a.timeoutHandle = Ff(Pk.bind(null, a, tk, uk), d);
                break;
              }
              Pk(a, tk, uk);
              break;
            case 5:
              Pk(a, tk, uk);
              break;
            default:
              throw Error(p(329));
          }
        }
      }
      Dk(a, B());
      return a.callbackNode === c ? Gk.bind(null, a) : null;
    }
    function Nk(a, b) {
      var c = sk;
      a.current.memoizedState.isDehydrated && (Kk(a, b).flags |= 256);
      a = Ik(a, b);
      2 !== a && (b = tk, tk = c, null !== b && Fj(b));
      return a;
    }
    function Fj(a) {
      null === tk ? tk = a : tk.push.apply(tk, a);
    }
    function Ok(a) {
      for (var b = a; ; ) {
        if (b.flags & 16384) {
          var c = b.updateQueue;
          if (null !== c && (c = c.stores, null !== c)) for (var d = 0; d < c.length; d++) {
            var e = c[d], f = e.getSnapshot;
            e = e.value;
            try {
              if (!He(f(), e)) return false;
            } catch (g) {
              return false;
            }
          }
        }
        c = b.child;
        if (b.subtreeFlags & 16384 && null !== c) c.return = b, b = c;
        else {
          if (b === a) break;
          for (; null === b.sibling; ) {
            if (null === b.return || b.return === a) return true;
            b = b.return;
          }
          b.sibling.return = b.return;
          b = b.sibling;
        }
      }
      return true;
    }
    function Ck(a, b) {
      b &= ~rk;
      b &= ~qk;
      a.suspendedLanes |= b;
      a.pingedLanes &= ~b;
      for (a = a.expirationTimes; 0 < b; ) {
        var c = 31 - oc(b), d = 1 << c;
        a[c] = -1;
        b &= ~d;
      }
    }
    function Ek(a) {
      if (0 !== (K & 6)) throw Error(p(327));
      Hk();
      var b = uc(a, 0);
      if (0 === (b & 1)) return Dk(a, B()), null;
      var c = Ik(a, b);
      if (0 !== a.tag && 2 === c) {
        var d = xc(a);
        0 !== d && (b = d, c = Nk(a, d));
      }
      if (1 === c) throw c = pk, Kk(a, 0), Ck(a, b), Dk(a, B()), c;
      if (6 === c) throw Error(p(345));
      a.finishedWork = a.current.alternate;
      a.finishedLanes = b;
      Pk(a, tk, uk);
      Dk(a, B());
      return null;
    }
    function Qk(a, b) {
      var c = K;
      K |= 1;
      try {
        return a(b);
      } finally {
        K = c, 0 === K && (Gj = B() + 500, fg && jg());
      }
    }
    function Rk(a) {
      null !== wk && 0 === wk.tag && 0 === (K & 6) && Hk();
      var b = K;
      K |= 1;
      var c = ok.transition, d = C;
      try {
        if (ok.transition = null, C = 1, a) return a();
      } finally {
        C = d, ok.transition = c, K = b, 0 === (K & 6) && jg();
      }
    }
    function Hj() {
      fj = ej.current;
      E(ej);
    }
    function Kk(a, b) {
      a.finishedWork = null;
      a.finishedLanes = 0;
      var c = a.timeoutHandle;
      -1 !== c && (a.timeoutHandle = -1, Gf(c));
      if (null !== Y) for (c = Y.return; null !== c; ) {
        var d = c;
        wg(d);
        switch (d.tag) {
          case 1:
            d = d.type.childContextTypes;
            null !== d && void 0 !== d && $f();
            break;
          case 3:
            zh();
            E(Wf);
            E(H);
            Eh();
            break;
          case 5:
            Bh(d);
            break;
          case 4:
            zh();
            break;
          case 13:
            E(L);
            break;
          case 19:
            E(L);
            break;
          case 10:
            ah(d.type._context);
            break;
          case 22:
          case 23:
            Hj();
        }
        c = c.return;
      }
      Q = a;
      Y = a = Pg(a.current, null);
      Z = fj = b;
      T = 0;
      pk = null;
      rk = qk = rh = 0;
      tk = sk = null;
      if (null !== fh) {
        for (b = 0; b < fh.length; b++) if (c = fh[b], d = c.interleaved, null !== d) {
          c.interleaved = null;
          var e = d.next, f = c.pending;
          if (null !== f) {
            var g = f.next;
            f.next = e;
            d.next = g;
          }
          c.pending = d;
        }
        fh = null;
      }
      return a;
    }
    function Mk(a, b) {
      do {
        var c = Y;
        try {
          $g();
          Fh.current = Rh;
          if (Ih) {
            for (var d = M.memoizedState; null !== d; ) {
              var e = d.queue;
              null !== e && (e.pending = null);
              d = d.next;
            }
            Ih = false;
          }
          Hh = 0;
          O = N = M = null;
          Jh = false;
          Kh = 0;
          nk.current = null;
          if (null === c || null === c.return) {
            T = 1;
            pk = b;
            Y = null;
            break;
          }
          a: {
            var f = a, g = c.return, h = c, k = b;
            b = Z;
            h.flags |= 32768;
            if (null !== k && "object" === typeof k && "function" === typeof k.then) {
              var l = k, m = h, q = m.tag;
              if (0 === (m.mode & 1) && (0 === q || 11 === q || 15 === q)) {
                var r2 = m.alternate;
                r2 ? (m.updateQueue = r2.updateQueue, m.memoizedState = r2.memoizedState, m.lanes = r2.lanes) : (m.updateQueue = null, m.memoizedState = null);
              }
              var y = Ui(g);
              if (null !== y) {
                y.flags &= -257;
                Vi(y, g, h, f, b);
                y.mode & 1 && Si(f, l, b);
                b = y;
                k = l;
                var n = b.updateQueue;
                if (null === n) {
                  var t = /* @__PURE__ */ new Set();
                  t.add(k);
                  b.updateQueue = t;
                } else n.add(k);
                break a;
              } else {
                if (0 === (b & 1)) {
                  Si(f, l, b);
                  tj();
                  break a;
                }
                k = Error(p(426));
              }
            } else if (I && h.mode & 1) {
              var J = Ui(g);
              if (null !== J) {
                0 === (J.flags & 65536) && (J.flags |= 256);
                Vi(J, g, h, f, b);
                Jg(Ji(k, h));
                break a;
              }
            }
            f = k = Ji(k, h);
            4 !== T && (T = 2);
            null === sk ? sk = [f] : sk.push(f);
            f = g;
            do {
              switch (f.tag) {
                case 3:
                  f.flags |= 65536;
                  b &= -b;
                  f.lanes |= b;
                  var x = Ni(f, k, b);
                  ph(f, x);
                  break a;
                case 1:
                  h = k;
                  var w = f.type, u = f.stateNode;
                  if (0 === (f.flags & 128) && ("function" === typeof w.getDerivedStateFromError || null !== u && "function" === typeof u.componentDidCatch && (null === Ri || !Ri.has(u)))) {
                    f.flags |= 65536;
                    b &= -b;
                    f.lanes |= b;
                    var F = Qi(f, h, b);
                    ph(f, F);
                    break a;
                  }
              }
              f = f.return;
            } while (null !== f);
          }
          Sk(c);
        } catch (na) {
          b = na;
          Y === c && null !== c && (Y = c = c.return);
          continue;
        }
        break;
      } while (1);
    }
    function Jk() {
      var a = mk.current;
      mk.current = Rh;
      return null === a ? Rh : a;
    }
    function tj() {
      if (0 === T || 3 === T || 2 === T) T = 4;
      null === Q || 0 === (rh & 268435455) && 0 === (qk & 268435455) || Ck(Q, Z);
    }
    function Ik(a, b) {
      var c = K;
      K |= 2;
      var d = Jk();
      if (Q !== a || Z !== b) uk = null, Kk(a, b);
      do
        try {
          Tk();
          break;
        } catch (e) {
          Mk(a, e);
        }
      while (1);
      $g();
      K = c;
      mk.current = d;
      if (null !== Y) throw Error(p(261));
      Q = null;
      Z = 0;
      return T;
    }
    function Tk() {
      for (; null !== Y; ) Uk(Y);
    }
    function Lk() {
      for (; null !== Y && !cc(); ) Uk(Y);
    }
    function Uk(a) {
      var b = Vk(a.alternate, a, fj);
      a.memoizedProps = a.pendingProps;
      null === b ? Sk(a) : Y = b;
      nk.current = null;
    }
    function Sk(a) {
      var b = a;
      do {
        var c = b.alternate;
        a = b.return;
        if (0 === (b.flags & 32768)) {
          if (c = Ej(c, b, fj), null !== c) {
            Y = c;
            return;
          }
        } else {
          c = Ij(c, b);
          if (null !== c) {
            c.flags &= 32767;
            Y = c;
            return;
          }
          if (null !== a) a.flags |= 32768, a.subtreeFlags = 0, a.deletions = null;
          else {
            T = 6;
            Y = null;
            return;
          }
        }
        b = b.sibling;
        if (null !== b) {
          Y = b;
          return;
        }
        Y = b = a;
      } while (null !== b);
      0 === T && (T = 5);
    }
    function Pk(a, b, c) {
      var d = C, e = ok.transition;
      try {
        ok.transition = null, C = 1, Wk(a, b, c, d);
      } finally {
        ok.transition = e, C = d;
      }
      return null;
    }
    function Wk(a, b, c, d) {
      do
        Hk();
      while (null !== wk);
      if (0 !== (K & 6)) throw Error(p(327));
      c = a.finishedWork;
      var e = a.finishedLanes;
      if (null === c) return null;
      a.finishedWork = null;
      a.finishedLanes = 0;
      if (c === a.current) throw Error(p(177));
      a.callbackNode = null;
      a.callbackPriority = 0;
      var f = c.lanes | c.childLanes;
      Bc(a, f);
      a === Q && (Y = Q = null, Z = 0);
      0 === (c.subtreeFlags & 2064) && 0 === (c.flags & 2064) || vk || (vk = true, Fk(hc, function() {
        Hk();
        return null;
      }));
      f = 0 !== (c.flags & 15990);
      if (0 !== (c.subtreeFlags & 15990) || f) {
        f = ok.transition;
        ok.transition = null;
        var g = C;
        C = 1;
        var h = K;
        K |= 4;
        nk.current = null;
        Oj(a, c);
        dk(c, a);
        Oe(Df);
        dd = !!Cf;
        Df = Cf = null;
        a.current = c;
        hk(c);
        dc();
        K = h;
        C = g;
        ok.transition = f;
      } else a.current = c;
      vk && (vk = false, wk = a, xk = e);
      f = a.pendingLanes;
      0 === f && (Ri = null);
      mc(c.stateNode);
      Dk(a, B());
      if (null !== b) for (d = a.onRecoverableError, c = 0; c < b.length; c++) e = b[c], d(e.value, { componentStack: e.stack, digest: e.digest });
      if (Oi) throw Oi = false, a = Pi, Pi = null, a;
      0 !== (xk & 1) && 0 !== a.tag && Hk();
      f = a.pendingLanes;
      0 !== (f & 1) ? a === zk ? yk++ : (yk = 0, zk = a) : yk = 0;
      jg();
      return null;
    }
    function Hk() {
      if (null !== wk) {
        var a = Dc(xk), b = ok.transition, c = C;
        try {
          ok.transition = null;
          C = 16 > a ? 16 : a;
          if (null === wk) var d = false;
          else {
            a = wk;
            wk = null;
            xk = 0;
            if (0 !== (K & 6)) throw Error(p(331));
            var e = K;
            K |= 4;
            for (V = a.current; null !== V; ) {
              var f = V, g = f.child;
              if (0 !== (V.flags & 16)) {
                var h = f.deletions;
                if (null !== h) {
                  for (var k = 0; k < h.length; k++) {
                    var l = h[k];
                    for (V = l; null !== V; ) {
                      var m = V;
                      switch (m.tag) {
                        case 0:
                        case 11:
                        case 15:
                          Pj(8, m, f);
                      }
                      var q = m.child;
                      if (null !== q) q.return = m, V = q;
                      else for (; null !== V; ) {
                        m = V;
                        var r2 = m.sibling, y = m.return;
                        Sj(m);
                        if (m === l) {
                          V = null;
                          break;
                        }
                        if (null !== r2) {
                          r2.return = y;
                          V = r2;
                          break;
                        }
                        V = y;
                      }
                    }
                  }
                  var n = f.alternate;
                  if (null !== n) {
                    var t = n.child;
                    if (null !== t) {
                      n.child = null;
                      do {
                        var J = t.sibling;
                        t.sibling = null;
                        t = J;
                      } while (null !== t);
                    }
                  }
                  V = f;
                }
              }
              if (0 !== (f.subtreeFlags & 2064) && null !== g) g.return = f, V = g;
              else b: for (; null !== V; ) {
                f = V;
                if (0 !== (f.flags & 2048)) switch (f.tag) {
                  case 0:
                  case 11:
                  case 15:
                    Pj(9, f, f.return);
                }
                var x = f.sibling;
                if (null !== x) {
                  x.return = f.return;
                  V = x;
                  break b;
                }
                V = f.return;
              }
            }
            var w = a.current;
            for (V = w; null !== V; ) {
              g = V;
              var u = g.child;
              if (0 !== (g.subtreeFlags & 2064) && null !== u) u.return = g, V = u;
              else b: for (g = w; null !== V; ) {
                h = V;
                if (0 !== (h.flags & 2048)) try {
                  switch (h.tag) {
                    case 0:
                    case 11:
                    case 15:
                      Qj(9, h);
                  }
                } catch (na) {
                  W(h, h.return, na);
                }
                if (h === g) {
                  V = null;
                  break b;
                }
                var F = h.sibling;
                if (null !== F) {
                  F.return = h.return;
                  V = F;
                  break b;
                }
                V = h.return;
              }
            }
            K = e;
            jg();
            if (lc && "function" === typeof lc.onPostCommitFiberRoot) try {
              lc.onPostCommitFiberRoot(kc, a);
            } catch (na) {
            }
            d = true;
          }
          return d;
        } finally {
          C = c, ok.transition = b;
        }
      }
      return false;
    }
    function Xk(a, b, c) {
      b = Ji(c, b);
      b = Ni(a, b, 1);
      a = nh(a, b, 1);
      b = R();
      null !== a && (Ac(a, 1, b), Dk(a, b));
    }
    function W(a, b, c) {
      if (3 === a.tag) Xk(a, a, c);
      else for (; null !== b; ) {
        if (3 === b.tag) {
          Xk(b, a, c);
          break;
        } else if (1 === b.tag) {
          var d = b.stateNode;
          if ("function" === typeof b.type.getDerivedStateFromError || "function" === typeof d.componentDidCatch && (null === Ri || !Ri.has(d))) {
            a = Ji(c, a);
            a = Qi(b, a, 1);
            b = nh(b, a, 1);
            a = R();
            null !== b && (Ac(b, 1, a), Dk(b, a));
            break;
          }
        }
        b = b.return;
      }
    }
    function Ti(a, b, c) {
      var d = a.pingCache;
      null !== d && d.delete(b);
      b = R();
      a.pingedLanes |= a.suspendedLanes & c;
      Q === a && (Z & c) === c && (4 === T || 3 === T && (Z & 130023424) === Z && 500 > B() - fk ? Kk(a, 0) : rk |= c);
      Dk(a, b);
    }
    function Yk(a, b) {
      0 === b && (0 === (a.mode & 1) ? b = 1 : (b = sc, sc <<= 1, 0 === (sc & 130023424) && (sc = 4194304)));
      var c = R();
      a = ih(a, b);
      null !== a && (Ac(a, b, c), Dk(a, c));
    }
    function uj(a) {
      var b = a.memoizedState, c = 0;
      null !== b && (c = b.retryLane);
      Yk(a, c);
    }
    function bk(a, b) {
      var c = 0;
      switch (a.tag) {
        case 13:
          var d = a.stateNode;
          var e = a.memoizedState;
          null !== e && (c = e.retryLane);
          break;
        case 19:
          d = a.stateNode;
          break;
        default:
          throw Error(p(314));
      }
      null !== d && d.delete(b);
      Yk(a, c);
    }
    var Vk;
    Vk = function(a, b, c) {
      if (null !== a) if (a.memoizedProps !== b.pendingProps || Wf.current) dh = true;
      else {
        if (0 === (a.lanes & c) && 0 === (b.flags & 128)) return dh = false, yj(a, b, c);
        dh = 0 !== (a.flags & 131072) ? true : false;
      }
      else dh = false, I && 0 !== (b.flags & 1048576) && ug(b, ng, b.index);
      b.lanes = 0;
      switch (b.tag) {
        case 2:
          var d = b.type;
          ij(a, b);
          a = b.pendingProps;
          var e = Yf(b, H.current);
          ch(b, c);
          e = Nh(null, b, d, a, e, c);
          var f = Sh();
          b.flags |= 1;
          "object" === typeof e && null !== e && "function" === typeof e.render && void 0 === e.$$typeof ? (b.tag = 1, b.memoizedState = null, b.updateQueue = null, Zf(d) ? (f = true, cg(b)) : f = false, b.memoizedState = null !== e.state && void 0 !== e.state ? e.state : null, kh(b), e.updater = Ei, b.stateNode = e, e._reactInternals = b, Ii(b, d, a, c), b = jj(null, b, d, true, f, c)) : (b.tag = 0, I && f && vg(b), Xi(null, b, e, c), b = b.child);
          return b;
        case 16:
          d = b.elementType;
          a: {
            ij(a, b);
            a = b.pendingProps;
            e = d._init;
            d = e(d._payload);
            b.type = d;
            e = b.tag = Zk(d);
            a = Ci(d, a);
            switch (e) {
              case 0:
                b = cj(null, b, d, a, c);
                break a;
              case 1:
                b = hj(null, b, d, a, c);
                break a;
              case 11:
                b = Yi(null, b, d, a, c);
                break a;
              case 14:
                b = $i(null, b, d, Ci(d.type, a), c);
                break a;
            }
            throw Error(p(
              306,
              d,
              ""
            ));
          }
          return b;
        case 0:
          return d = b.type, e = b.pendingProps, e = b.elementType === d ? e : Ci(d, e), cj(a, b, d, e, c);
        case 1:
          return d = b.type, e = b.pendingProps, e = b.elementType === d ? e : Ci(d, e), hj(a, b, d, e, c);
        case 3:
          a: {
            kj(b);
            if (null === a) throw Error(p(387));
            d = b.pendingProps;
            f = b.memoizedState;
            e = f.element;
            lh(a, b);
            qh(b, d, null, c);
            var g = b.memoizedState;
            d = g.element;
            if (f.isDehydrated) if (f = { element: d, isDehydrated: false, cache: g.cache, pendingSuspenseBoundaries: g.pendingSuspenseBoundaries, transitions: g.transitions }, b.updateQueue.baseState = f, b.memoizedState = f, b.flags & 256) {
              e = Ji(Error(p(423)), b);
              b = lj(a, b, d, c, e);
              break a;
            } else if (d !== e) {
              e = Ji(Error(p(424)), b);
              b = lj(a, b, d, c, e);
              break a;
            } else for (yg = Lf(b.stateNode.containerInfo.firstChild), xg = b, I = true, zg = null, c = Vg(b, null, d, c), b.child = c; c; ) c.flags = c.flags & -3 | 4096, c = c.sibling;
            else {
              Ig();
              if (d === e) {
                b = Zi(a, b, c);
                break a;
              }
              Xi(a, b, d, c);
            }
            b = b.child;
          }
          return b;
        case 5:
          return Ah(b), null === a && Eg(b), d = b.type, e = b.pendingProps, f = null !== a ? a.memoizedProps : null, g = e.children, Ef(d, e) ? g = null : null !== f && Ef(d, f) && (b.flags |= 32), gj(a, b), Xi(a, b, g, c), b.child;
        case 6:
          return null === a && Eg(b), null;
        case 13:
          return oj(a, b, c);
        case 4:
          return yh(b, b.stateNode.containerInfo), d = b.pendingProps, null === a ? b.child = Ug(b, null, d, c) : Xi(a, b, d, c), b.child;
        case 11:
          return d = b.type, e = b.pendingProps, e = b.elementType === d ? e : Ci(d, e), Yi(a, b, d, e, c);
        case 7:
          return Xi(a, b, b.pendingProps, c), b.child;
        case 8:
          return Xi(a, b, b.pendingProps.children, c), b.child;
        case 12:
          return Xi(a, b, b.pendingProps.children, c), b.child;
        case 10:
          a: {
            d = b.type._context;
            e = b.pendingProps;
            f = b.memoizedProps;
            g = e.value;
            G(Wg, d._currentValue);
            d._currentValue = g;
            if (null !== f) if (He(f.value, g)) {
              if (f.children === e.children && !Wf.current) {
                b = Zi(a, b, c);
                break a;
              }
            } else for (f = b.child, null !== f && (f.return = b); null !== f; ) {
              var h = f.dependencies;
              if (null !== h) {
                g = f.child;
                for (var k = h.firstContext; null !== k; ) {
                  if (k.context === d) {
                    if (1 === f.tag) {
                      k = mh(-1, c & -c);
                      k.tag = 2;
                      var l = f.updateQueue;
                      if (null !== l) {
                        l = l.shared;
                        var m = l.pending;
                        null === m ? k.next = k : (k.next = m.next, m.next = k);
                        l.pending = k;
                      }
                    }
                    f.lanes |= c;
                    k = f.alternate;
                    null !== k && (k.lanes |= c);
                    bh(
                      f.return,
                      c,
                      b
                    );
                    h.lanes |= c;
                    break;
                  }
                  k = k.next;
                }
              } else if (10 === f.tag) g = f.type === b.type ? null : f.child;
              else if (18 === f.tag) {
                g = f.return;
                if (null === g) throw Error(p(341));
                g.lanes |= c;
                h = g.alternate;
                null !== h && (h.lanes |= c);
                bh(g, c, b);
                g = f.sibling;
              } else g = f.child;
              if (null !== g) g.return = f;
              else for (g = f; null !== g; ) {
                if (g === b) {
                  g = null;
                  break;
                }
                f = g.sibling;
                if (null !== f) {
                  f.return = g.return;
                  g = f;
                  break;
                }
                g = g.return;
              }
              f = g;
            }
            Xi(a, b, e.children, c);
            b = b.child;
          }
          return b;
        case 9:
          return e = b.type, d = b.pendingProps.children, ch(b, c), e = eh(e), d = d(e), b.flags |= 1, Xi(a, b, d, c), b.child;
        case 14:
          return d = b.type, e = Ci(d, b.pendingProps), e = Ci(d.type, e), $i(a, b, d, e, c);
        case 15:
          return bj(a, b, b.type, b.pendingProps, c);
        case 17:
          return d = b.type, e = b.pendingProps, e = b.elementType === d ? e : Ci(d, e), ij(a, b), b.tag = 1, Zf(d) ? (a = true, cg(b)) : a = false, ch(b, c), Gi(b, d, e), Ii(b, d, e, c), jj(null, b, d, true, a, c);
        case 19:
          return xj(a, b, c);
        case 22:
          return dj(a, b, c);
      }
      throw Error(p(156, b.tag));
    };
    function Fk(a, b) {
      return ac(a, b);
    }
    function $k(a, b, c, d) {
      this.tag = a;
      this.key = c;
      this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null;
      this.index = 0;
      this.ref = null;
      this.pendingProps = b;
      this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null;
      this.mode = d;
      this.subtreeFlags = this.flags = 0;
      this.deletions = null;
      this.childLanes = this.lanes = 0;
      this.alternate = null;
    }
    function Bg(a, b, c, d) {
      return new $k(a, b, c, d);
    }
    function aj(a) {
      a = a.prototype;
      return !(!a || !a.isReactComponent);
    }
    function Zk(a) {
      if ("function" === typeof a) return aj(a) ? 1 : 0;
      if (void 0 !== a && null !== a) {
        a = a.$$typeof;
        if (a === Da) return 11;
        if (a === Ga) return 14;
      }
      return 2;
    }
    function Pg(a, b) {
      var c = a.alternate;
      null === c ? (c = Bg(a.tag, b, a.key, a.mode), c.elementType = a.elementType, c.type = a.type, c.stateNode = a.stateNode, c.alternate = a, a.alternate = c) : (c.pendingProps = b, c.type = a.type, c.flags = 0, c.subtreeFlags = 0, c.deletions = null);
      c.flags = a.flags & 14680064;
      c.childLanes = a.childLanes;
      c.lanes = a.lanes;
      c.child = a.child;
      c.memoizedProps = a.memoizedProps;
      c.memoizedState = a.memoizedState;
      c.updateQueue = a.updateQueue;
      b = a.dependencies;
      c.dependencies = null === b ? null : { lanes: b.lanes, firstContext: b.firstContext };
      c.sibling = a.sibling;
      c.index = a.index;
      c.ref = a.ref;
      return c;
    }
    function Rg(a, b, c, d, e, f) {
      var g = 2;
      d = a;
      if ("function" === typeof a) aj(a) && (g = 1);
      else if ("string" === typeof a) g = 5;
      else a: switch (a) {
        case ya:
          return Tg(c.children, e, f, b);
        case za:
          g = 8;
          e |= 8;
          break;
        case Aa:
          return a = Bg(12, c, b, e | 2), a.elementType = Aa, a.lanes = f, a;
        case Ea:
          return a = Bg(13, c, b, e), a.elementType = Ea, a.lanes = f, a;
        case Fa:
          return a = Bg(19, c, b, e), a.elementType = Fa, a.lanes = f, a;
        case Ia:
          return pj(c, e, f, b);
        default:
          if ("object" === typeof a && null !== a) switch (a.$$typeof) {
            case Ba:
              g = 10;
              break a;
            case Ca:
              g = 9;
              break a;
            case Da:
              g = 11;
              break a;
            case Ga:
              g = 14;
              break a;
            case Ha:
              g = 16;
              d = null;
              break a;
          }
          throw Error(p(130, null == a ? a : typeof a, ""));
      }
      b = Bg(g, c, b, e);
      b.elementType = a;
      b.type = d;
      b.lanes = f;
      return b;
    }
    function Tg(a, b, c, d) {
      a = Bg(7, a, d, b);
      a.lanes = c;
      return a;
    }
    function pj(a, b, c, d) {
      a = Bg(22, a, d, b);
      a.elementType = Ia;
      a.lanes = c;
      a.stateNode = { isHidden: false };
      return a;
    }
    function Qg(a, b, c) {
      a = Bg(6, a, null, b);
      a.lanes = c;
      return a;
    }
    function Sg(a, b, c) {
      b = Bg(4, null !== a.children ? a.children : [], a.key, b);
      b.lanes = c;
      b.stateNode = { containerInfo: a.containerInfo, pendingChildren: null, implementation: a.implementation };
      return b;
    }
    function al(a, b, c, d, e) {
      this.tag = b;
      this.containerInfo = a;
      this.finishedWork = this.pingCache = this.current = this.pendingChildren = null;
      this.timeoutHandle = -1;
      this.callbackNode = this.pendingContext = this.context = null;
      this.callbackPriority = 0;
      this.eventTimes = zc(0);
      this.expirationTimes = zc(-1);
      this.entangledLanes = this.finishedLanes = this.mutableReadLanes = this.expiredLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0;
      this.entanglements = zc(0);
      this.identifierPrefix = d;
      this.onRecoverableError = e;
      this.mutableSourceEagerHydrationData = null;
    }
    function bl(a, b, c, d, e, f, g, h, k) {
      a = new al(a, b, c, h, k);
      1 === b ? (b = 1, true === f && (b |= 8)) : b = 0;
      f = Bg(3, null, null, b);
      a.current = f;
      f.stateNode = a;
      f.memoizedState = { element: d, isDehydrated: c, cache: null, transitions: null, pendingSuspenseBoundaries: null };
      kh(f);
      return a;
    }
    function cl(a, b, c) {
      var d = 3 < arguments.length && void 0 !== arguments[3] ? arguments[3] : null;
      return { $$typeof: wa, key: null == d ? null : "" + d, children: a, containerInfo: b, implementation: c };
    }
    function dl(a) {
      if (!a) return Vf;
      a = a._reactInternals;
      a: {
        if (Vb(a) !== a || 1 !== a.tag) throw Error(p(170));
        var b = a;
        do {
          switch (b.tag) {
            case 3:
              b = b.stateNode.context;
              break a;
            case 1:
              if (Zf(b.type)) {
                b = b.stateNode.__reactInternalMemoizedMergedChildContext;
                break a;
              }
          }
          b = b.return;
        } while (null !== b);
        throw Error(p(171));
      }
      if (1 === a.tag) {
        var c = a.type;
        if (Zf(c)) return bg(a, c, b);
      }
      return b;
    }
    function el(a, b, c, d, e, f, g, h, k) {
      a = bl(c, d, true, a, e, f, g, h, k);
      a.context = dl(null);
      c = a.current;
      d = R();
      e = yi(c);
      f = mh(d, e);
      f.callback = void 0 !== b && null !== b ? b : null;
      nh(c, f, e);
      a.current.lanes = e;
      Ac(a, e, d);
      Dk(a, d);
      return a;
    }
    function fl(a, b, c, d) {
      var e = b.current, f = R(), g = yi(e);
      c = dl(c);
      null === b.context ? b.context = c : b.pendingContext = c;
      b = mh(f, g);
      b.payload = { element: a };
      d = void 0 === d ? null : d;
      null !== d && (b.callback = d);
      a = nh(e, b, g);
      null !== a && (gi(a, e, g, f), oh(a, e, g));
      return g;
    }
    function gl(a) {
      a = a.current;
      if (!a.child) return null;
      switch (a.child.tag) {
        case 5:
          return a.child.stateNode;
        default:
          return a.child.stateNode;
      }
    }
    function hl(a, b) {
      a = a.memoizedState;
      if (null !== a && null !== a.dehydrated) {
        var c = a.retryLane;
        a.retryLane = 0 !== c && c < b ? c : b;
      }
    }
    function il(a, b) {
      hl(a, b);
      (a = a.alternate) && hl(a, b);
    }
    function jl() {
      return null;
    }
    var kl = "function" === typeof reportError ? reportError : function(a) {
      console.error(a);
    };
    function ll(a) {
      this._internalRoot = a;
    }
    ml.prototype.render = ll.prototype.render = function(a) {
      var b = this._internalRoot;
      if (null === b) throw Error(p(409));
      fl(a, b, null, null);
    };
    ml.prototype.unmount = ll.prototype.unmount = function() {
      var a = this._internalRoot;
      if (null !== a) {
        this._internalRoot = null;
        var b = a.containerInfo;
        Rk(function() {
          fl(null, a, null, null);
        });
        b[uf] = null;
      }
    };
    function ml(a) {
      this._internalRoot = a;
    }
    ml.prototype.unstable_scheduleHydration = function(a) {
      if (a) {
        var b = Hc();
        a = { blockedOn: null, target: a, priority: b };
        for (var c = 0; c < Qc.length && 0 !== b && b < Qc[c].priority; c++) ;
        Qc.splice(c, 0, a);
        0 === c && Vc(a);
      }
    };
    function nl(a) {
      return !(!a || 1 !== a.nodeType && 9 !== a.nodeType && 11 !== a.nodeType);
    }
    function ol(a) {
      return !(!a || 1 !== a.nodeType && 9 !== a.nodeType && 11 !== a.nodeType && (8 !== a.nodeType || " react-mount-point-unstable " !== a.nodeValue));
    }
    function pl() {
    }
    function ql(a, b, c, d, e) {
      if (e) {
        if ("function" === typeof d) {
          var f = d;
          d = function() {
            var a2 = gl(g);
            f.call(a2);
          };
        }
        var g = el(b, d, a, 0, null, false, false, "", pl);
        a._reactRootContainer = g;
        a[uf] = g.current;
        sf(8 === a.nodeType ? a.parentNode : a);
        Rk();
        return g;
      }
      for (; e = a.lastChild; ) a.removeChild(e);
      if ("function" === typeof d) {
        var h = d;
        d = function() {
          var a2 = gl(k);
          h.call(a2);
        };
      }
      var k = bl(a, 0, false, null, null, false, false, "", pl);
      a._reactRootContainer = k;
      a[uf] = k.current;
      sf(8 === a.nodeType ? a.parentNode : a);
      Rk(function() {
        fl(b, k, c, d);
      });
      return k;
    }
    function rl(a, b, c, d, e) {
      var f = c._reactRootContainer;
      if (f) {
        var g = f;
        if ("function" === typeof e) {
          var h = e;
          e = function() {
            var a2 = gl(g);
            h.call(a2);
          };
        }
        fl(b, g, a, e);
      } else g = ql(c, b, a, e, d);
      return gl(g);
    }
    Ec = function(a) {
      switch (a.tag) {
        case 3:
          var b = a.stateNode;
          if (b.current.memoizedState.isDehydrated) {
            var c = tc(b.pendingLanes);
            0 !== c && (Cc(b, c | 1), Dk(b, B()), 0 === (K & 6) && (Gj = B() + 500, jg()));
          }
          break;
        case 13:
          Rk(function() {
            var b2 = ih(a, 1);
            if (null !== b2) {
              var c2 = R();
              gi(b2, a, 1, c2);
            }
          }), il(a, 1);
      }
    };
    Fc = function(a) {
      if (13 === a.tag) {
        var b = ih(a, 134217728);
        if (null !== b) {
          var c = R();
          gi(b, a, 134217728, c);
        }
        il(a, 134217728);
      }
    };
    Gc = function(a) {
      if (13 === a.tag) {
        var b = yi(a), c = ih(a, b);
        if (null !== c) {
          var d = R();
          gi(c, a, b, d);
        }
        il(a, b);
      }
    };
    Hc = function() {
      return C;
    };
    Ic = function(a, b) {
      var c = C;
      try {
        return C = a, b();
      } finally {
        C = c;
      }
    };
    yb = function(a, b, c) {
      switch (b) {
        case "input":
          bb(a, c);
          b = c.name;
          if ("radio" === c.type && null != b) {
            for (c = a; c.parentNode; ) c = c.parentNode;
            c = c.querySelectorAll("input[name=" + JSON.stringify("" + b) + '][type="radio"]');
            for (b = 0; b < c.length; b++) {
              var d = c[b];
              if (d !== a && d.form === a.form) {
                var e = Db(d);
                if (!e) throw Error(p(90));
                Wa(d);
                bb(d, e);
              }
            }
          }
          break;
        case "textarea":
          ib(a, c);
          break;
        case "select":
          b = c.value, null != b && fb(a, !!c.multiple, b, false);
      }
    };
    Gb = Qk;
    Hb = Rk;
    var sl = { usingClientEntryPoint: false, Events: [Cb, ue, Db, Eb, Fb, Qk] }, tl = { findFiberByHostInstance: Wc, bundleType: 0, version: "18.3.1", rendererPackageName: "react-dom" };
    var ul = { bundleType: tl.bundleType, version: tl.version, rendererPackageName: tl.rendererPackageName, rendererConfig: tl.rendererConfig, overrideHookState: null, overrideHookStateDeletePath: null, overrideHookStateRenamePath: null, overrideProps: null, overridePropsDeletePath: null, overridePropsRenamePath: null, setErrorHandler: null, setSuspenseHandler: null, scheduleUpdate: null, currentDispatcherRef: ua.ReactCurrentDispatcher, findHostInstanceByFiber: function(a) {
      a = Zb(a);
      return null === a ? null : a.stateNode;
    }, findFiberByHostInstance: tl.findFiberByHostInstance || jl, findHostInstancesForRefresh: null, scheduleRefresh: null, scheduleRoot: null, setRefreshHandler: null, getCurrentFiber: null, reconcilerVersion: "18.3.1-next-f1338f8080-20240426" };
    if ("undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__) {
      var vl = __REACT_DEVTOOLS_GLOBAL_HOOK__;
      if (!vl.isDisabled && vl.supportsFiber) try {
        kc = vl.inject(ul), lc = vl;
      } catch (a) {
      }
    }
    reactDom_production_min.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = sl;
    reactDom_production_min.createPortal = function(a, b) {
      var c = 2 < arguments.length && void 0 !== arguments[2] ? arguments[2] : null;
      if (!nl(b)) throw Error(p(200));
      return cl(a, b, null, c);
    };
    reactDom_production_min.createRoot = function(a, b) {
      if (!nl(a)) throw Error(p(299));
      var c = false, d = "", e = kl;
      null !== b && void 0 !== b && (true === b.unstable_strictMode && (c = true), void 0 !== b.identifierPrefix && (d = b.identifierPrefix), void 0 !== b.onRecoverableError && (e = b.onRecoverableError));
      b = bl(a, 1, false, null, null, c, false, d, e);
      a[uf] = b.current;
      sf(8 === a.nodeType ? a.parentNode : a);
      return new ll(b);
    };
    reactDom_production_min.findDOMNode = function(a) {
      if (null == a) return null;
      if (1 === a.nodeType) return a;
      var b = a._reactInternals;
      if (void 0 === b) {
        if ("function" === typeof a.render) throw Error(p(188));
        a = Object.keys(a).join(",");
        throw Error(p(268, a));
      }
      a = Zb(b);
      a = null === a ? null : a.stateNode;
      return a;
    };
    reactDom_production_min.flushSync = function(a) {
      return Rk(a);
    };
    reactDom_production_min.hydrate = function(a, b, c) {
      if (!ol(b)) throw Error(p(200));
      return rl(null, a, b, true, c);
    };
    reactDom_production_min.hydrateRoot = function(a, b, c) {
      if (!nl(a)) throw Error(p(405));
      var d = null != c && c.hydratedSources || null, e = false, f = "", g = kl;
      null !== c && void 0 !== c && (true === c.unstable_strictMode && (e = true), void 0 !== c.identifierPrefix && (f = c.identifierPrefix), void 0 !== c.onRecoverableError && (g = c.onRecoverableError));
      b = el(b, null, a, 1, null != c ? c : null, e, false, f, g);
      a[uf] = b.current;
      sf(a);
      if (d) for (a = 0; a < d.length; a++) c = d[a], e = c._getVersion, e = e(c._source), null == b.mutableSourceEagerHydrationData ? b.mutableSourceEagerHydrationData = [c, e] : b.mutableSourceEagerHydrationData.push(
        c,
        e
      );
      return new ml(b);
    };
    reactDom_production_min.render = function(a, b, c) {
      if (!ol(b)) throw Error(p(200));
      return rl(null, a, b, false, c);
    };
    reactDom_production_min.unmountComponentAtNode = function(a) {
      if (!ol(a)) throw Error(p(40));
      return a._reactRootContainer ? (Rk(function() {
        rl(null, null, a, false, function() {
          a._reactRootContainer = null;
          a[uf] = null;
        });
      }), true) : false;
    };
    reactDom_production_min.unstable_batchedUpdates = Qk;
    reactDom_production_min.unstable_renderSubtreeIntoContainer = function(a, b, c, d) {
      if (!ol(c)) throw Error(p(200));
      if (null == a || void 0 === a._reactInternals) throw Error(p(38));
      return rl(a, b, c, false, d);
    };
    reactDom_production_min.version = "18.3.1-next-f1338f8080-20240426";
    return reactDom_production_min;
  }
  var hasRequiredReactDom;
  function requireReactDom() {
    if (hasRequiredReactDom) return reactDom.exports;
    hasRequiredReactDom = 1;
    function checkDCE() {
      if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ === "undefined" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE !== "function") {
        return;
      }
      try {
        __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(checkDCE);
      } catch (err) {
        console.error(err);
      }
    }
    {
      checkDCE();
      reactDom.exports = requireReactDom_production_min();
    }
    return reactDom.exports;
  }
  var hasRequiredClient;
  function requireClient() {
    if (hasRequiredClient) return client;
    hasRequiredClient = 1;
    var m = requireReactDom();
    {
      client.createRoot = m.createRoot;
      client.hydrateRoot = m.hydrateRoot;
    }
    return client;
  }
  var clientExports = requireClient();
  function MenuItem({ item, index, prefix = "", open, setOpenIndex }) {
    const ref = reactExports.useRef(null);
    const openRef = reactExports.useRef(open);
    reactExports.useEffect(() => {
      openRef.current = open;
    }, [open]);
    const handleClickOutside = (event) => {
      if (!openRef.current) return;
      if (ref.current && !ref.current.contains(event.target)) {
        setOpenIndex(null);
      }
    };
    reactExports.useEffect(() => {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);
    const handleBlur = (event) => {
      var _a;
      if (!((_a = ref.current) == null ? void 0 : _a.contains(event.relatedTarget))) {
        setOpenIndex(null);
      }
    };
    const getCurrentPage = (e) => {
      return window.location.href.includes(e.replaceAll(" ", "-")) ? "page" : void 0;
    };
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        key: index,
        className: "item-container",
        onMouseEnter: () => setOpenIndex(index)
      },
      /* @__PURE__ */ React.createElement(
        Link,
        {
          className: "level-1",
          href: `${prefix}${item.slug}`,
          "aria-current": getCurrentPage(item.title)
        },
        item.title
      ),
      item._children.length > 0 && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(
        "button",
        {
          className: "toggle-submenu",
          onClick: () => {
            setOpenIndex(index);
          },
          "aria-expanded": open,
          "aria-controls": `submenu-${index}`
        },
        /* @__PURE__ */ React.createElement("i", { className: "ri-arrow-down-s-line" }),
        /* @__PURE__ */ React.createElement("span", { className: "sr-only" }, open ? "Verberg onderliggende pagina's" : "Toon onderliggende pagina's")
      ), /* @__PURE__ */ React.createElement(
        "div",
        {
          className: "submenu",
          id: `submenu-${index}`,
          hidden: !open,
          onMouseLeave: () => setOpenIndex(null),
          onBlur: handleBlur,
          tabIndex: -1,
          ref
        },
        item._children && item._children.map((child, childIndex) => /* @__PURE__ */ React.createElement(
          Link,
          {
            className: "level-2",
            key: `${index}-${childIndex}`,
            href: `${prefix}${child.slug}`,
            "aria-current": getCurrentPage(child.title)
          },
          child.title
        ))
      ))
    );
  }
  function parseJSON(value, fallback) {
    if (typeof value !== "string" || value.trim() === "") return fallback;
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  }
  function NavBar2({ home, content, prefix = "" }) {
    const [openIndex, setOpenIndex] = reactExports.useState(null);
    const homeItems = parseJSON(home, []);
    const menuItems = parseJSON(content, []);
    reactExports.useEffect(() => {
      const event = new Event("navBarLoaded");
      document.dispatchEvent(event);
    }, []);
    const getCurrentPage = (e) => {
      if (e === "Home") {
        return window.location.pathname === "/" ? "page" : void 0;
      }
    };
    return /* @__PURE__ */ React.createElement("div", { className: "container" }, /* @__PURE__ */ React.createElement("nav", { id: "main-menu", "aria-label": "Hoofdnavigatie" }, homeItems.map((item, index) => {
      return /* @__PURE__ */ React.createElement("div", { key: index, className: "item-container" }, /* @__PURE__ */ React.createElement(
        Link,
        {
          className: "level-1",
          key: index,
          href: item._url,
          "aria-current": getCurrentPage(item.title)
        },
        item.title
      ));
    }), menuItems.map((item, index) => {
      return /* @__PURE__ */ React.createElement(
        MenuItem,
        {
          key: index,
          item,
          index,
          prefix,
          open: openIndex === index,
          setOpenIndex
        }
      );
    })));
  }
  NavBar2.loadWidgetOnElement = function(container, props) {
    const Component = this;
    if (container) {
      const root = clientExports.createRoot(container);
      root.render(/* @__PURE__ */ React.createElement(Component, { ...props }));
    }
  };
  exports.NavBar = NavBar2;
  Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
  return exports;
})({});

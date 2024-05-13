const path = require("path");
//const HtmlWebpackPlugin = require("html-webpack-plugin");

/*We are basically telling webpack to take index.js from entry. Then check for all file extensions in resolve. 
After that apply all the rules in module.rules and produce the output and place it in main.js in the public folder.*/

module.exports = {
  /** "mode"
   * the environment - development, production, none. tells webpack
   * to use its built-in optimizations accordingly. default is production
   */
  mode: "development",
  /** "entry"
   * the entry point
   */
  entry: "./index.tsx",
  output: {
    /** "path"
     * the folder path of the output file
     */
    path: path.resolve(__dirname, "public"),
    /** "filename"
     * the name of the output file
     */
    filename: "main.js",
  },
  /** "target"
   * setting "node" as target app (server side), and setting it as "web" is
   * for browser (client side). Default is "web"
   */
  target: "web",
  devServer: {
    /** "port"
     * port of dev server
     */
    port: "9500",
    /** "static"
     * This property tells Webpack what static file it should serve
     */
    static: ["./public"],
    /** "open"
     * opens the browser after server is successfully started
     */
    open: true,
    /** "hot"
     * enabling and disabling HMR. takes "true", "false" and "only".
     * "only" is used if enable Hot Module Replacement without page
     * refresh as a fallback in case of build failures
     */
    hot: true,
    /** "liveReload"
     * disable live reload on the browser. "hot" must be set to false for this to work
     */
    liveReload: true,
  },
  devtool: "source-map",
  resolve: {
    /** "extensions"
     * If multiple files share the same name but have different extensions, webpack will
     * resolve the one with the extension listed first in the array and skip the rest.
     * This is what enables users to leave off the extension when importing
     */
    extensions: [".ts", ".js", ".tsx", ".jsx", ".json"],
    fallback: {
      crypto: require.resolve("crypto-browserify"),
      vm: require.resolve("vm-browserify"),
      stream: require.resolve("stream-browserify"),
      "tfhe_bg.wasm": require.resolve("tfhe/tfhe_bg.wasm"),
      "node-tfhe": require.resolve("tfhe/tfhe"),
    },
    // alias: {
    //   'tfhe_bg.wasm$': path.resolve(__dirname, 'node_modules/fhevmjs/node_modules/tfhe/tfhe_bg.wasm'),
    //    // 'wbg': path.resolve(__dirname, 'node_modules/fhevmjs/node_modules/node/tfhe.js'),
    //    // 'tfhe_bg.wasm$': path.resolve(__dirname, 'node_modules/fhevmjs/node_modules/node-tfhe/tfhe_bg.wasm'),
    //    // 'wbg': path.resolve(__dirname, 'node_modules/fhevmjs/node_modules/tfhe/wbg'),
    // }, // Hacky fix to find the tfhe_bg.wasm
    // alias: {
    //   'tfhe_bg.wasm$': path.resolve(__dirname, '/home/mlnd42/Documents/programming/front/ui-confidential-erc1155/node_modules/.pnpm/fhevmjs@0.4.0/node_modules/tfhe/tfhe_bg.wasm'),
    // }, // Hacky fix to find the tfhe_bg.wasm when using pnpm
  },
  experiments: {
    syncWebAssembly: true,
  },
  // module:{
  //     /** "rules"
  //      * This says - "Hey webpack compiler, when you come across a path that resolves to a '.js or .jsx'
  //      * file inside of a require()/import statement, use the babel-loader to transform it before you
  //      * add it to the bundle. And in this process, kindly make sure to exclude node_modules folder from
  //      * being searched"
  //      */
  //     rules: [
  //         {
  //             test: /\.(ts|tsx|js|jsx)$/,    //kind of file extension this rule should look for and apply in test
  //             exclude: /node_modules/, //folder to be excluded
  //             use:  'babel-loader' //loader which we are going to use
  //         }
  //     ]
  // }
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: [/node_modules/, /\.wasm$/],
        use: "ts-loader",
      },
      // {
      //   test: /\.wasm$/,
      //   type: 'javascript/auto',
      //   use: 'file-loader',
      // },
      // {
      //   test: /\.wasm$/,
      //   type: 'webassembly/sync',
      // },
    ],
  },
};

import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css?family=Muli:400,400i,700,700i,800"
        />
        <link rel="stylesheet" href="/css/prism.min.css" />
        <script src="/js/prism.min.js" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
      <script
        async
        src="https://www.googletagmanager.com/gtag/js?id=G-EWKJQL7TN6"
      />
      <script src="/js/gtag.js" />
      <script
        data-name="BMC-Widget"
        data-cfasync="false"
        src="https://cdnjs.buymeacoffee.com/1.0.0/widget.prod.min.js"
        data-id="svenit"
        data-description="Support me on Buy me a coffee!"
        data-message=""
        data-color="#5F7FFF"
        data-position="Right"
        data-x_margin="38"
        data-y_margin="38"
      ></script>
    </Html>
  );
}

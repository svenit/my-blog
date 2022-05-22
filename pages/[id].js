import { Fragment, useEffect } from "react";
import Head from "next/head";
import { getDatabase, getPage, getBlocks } from "../lib/notion";
import Link from "next/link";
import { databaseId } from "./index.js";
import styles from "../styles/post.module.css";
import { useRouter } from "next/dist/client/router";
import { useMemo } from "react/cjs/react.production.min";
import Logo from "../components/Logo";

export const Text = ({ text }) => {
  if (!text) {
    return null;
  }
  return text.map((value, key) => {
    const {
      annotations: { bold, code, color, italic, strikethrough, underline },
      text,
    } = value;
    return (
      <span
        key={key}
        className={[
          bold ? styles.bold : "",
          code ? styles.code : "",
          italic ? styles.italic : "",
          strikethrough ? styles.strikethrough : "",
          underline ? styles.underline : "",
        ].join(" ")}
        style={color !== "default" ? { color } : {}}
      >
        {text.link ? <a href={text.link.url}>{text.content}</a> : text.content}
      </span>
    );
  });
};

const renderNestedList = (block) => {
  const { type } = block;
  const value = block[type];
  if (!value) return null;

  const isNumberedList = value.children[0].type === "numbered_list_item";

  if (isNumberedList) {
    return <ol>{value.children.map((block) => renderBlock(block))}</ol>;
  }
  return <ul>{value.children.map((block) => renderBlock(block))}</ul>;
};

const renderBlock = (block) => {
  const { type, id } = block;
  const value = block[type];

  switch (type) {
    case "paragraph":
      return (
        <p>
          <Text text={value.text} />
        </p>
      );
    case "heading_1":
      return (
        <h1>
          <Text text={value.text} />
        </h1>
      );
    case "heading_2":
      return (
        <h2>
          <Text text={value.text} />
        </h2>
      );
    case "heading_3":
      return (
        <h3>
          <Text text={value.text} />
        </h3>
      );
    case "bulleted_list_item":
    case "numbered_list_item":
      return (
        <li>
          <Text text={value.text} />
          {!!value.children && renderNestedList(block)}
        </li>
      );
    case "to_do":
      return (
        <div>
          <label htmlFor={id}>
            <input type="checkbox" id={id} defaultChecked={value.checked} />{" "}
            <Text text={value.text} />
          </label>
        </div>
      );
    case "toggle":
      return (
        <details>
          <summary>
            <Text text={value.text} />
          </summary>
          {value.children?.map((block) => (
            <Fragment key={block.id}>{renderBlock(block)}</Fragment>
          ))}
        </details>
      );
    case "child_page":
      return <p>{value.title}</p>;
    case "image":
      const src =
        value.type === "external" ? value.external.url : value.file.url;
      const caption = value.caption ? value.caption[0]?.plain_text : "";
      return (
        <figure>
          <img src={src} alt={caption} />
          {caption && <figcaption>{caption}</figcaption>}
        </figure>
      );
    case "divider":
      return <hr key={id} />;
    case "quote":
      return <blockquote key={id}>{value.text[0].plain_text}</blockquote>;
    case "code":
      return (
        <pre className={styles.pre}>
          <code className="language-js line-numbers" key={id}>
            {value.text[0].plain_text}
          </code>
        </pre>
      );
    case "file":
      const src_file =
        value.type === "external" ? value.external.url : value.file.url;
      const splitSourceArray = src_file.split("/");
      const lastElementInArray = splitSourceArray[splitSourceArray.length - 1];
      const caption_file = value.caption ? value.caption[0]?.plain_text : "";
      return (
        <figure>
          <div className={styles.file}>
            📎{" "}
            <Link href={src_file} passHref>
              {lastElementInArray.split("?")[0]}
            </Link>
          </div>
          {caption_file && <figcaption>{caption_file}</figcaption>}
        </figure>
      );
    case "bookmark":
      const href = value.url;
      return (
        <a href={href} target="_brank" className={styles.bookmark}>
          {href}
        </a>
      );
    default:
      return `❌ Unsupported block (${
        type === "unsupported" ? "unsupported by Notion API" : type
      })`;
  }
};

export default function Post({ page, blocks, baseUrl = "" }) {
  useEffect(() => {
    window.Prism.highlightAll();
  }, []);
  const router = useRouter();

  if (!page || !blocks) {
    return <div />;
  }

  const currentUrl = baseUrl.concat(router.asPath);

  const coverImage = () => {
    let image = "";
    if (page.cover) {
      const { type } = page.cover;
      if (type == "file") {
        image = page.cover.file.url;
      }
      if (type == "external") {
        image = page.cover.external.url;
      }
    }
    return image;
  };

  return (
    <div>
      <Head>
        <title>{page.properties.Name.title[0].plain_text}</title>
        <meta property="og:locale" content="vi_VN" />
        <meta property="og:locale:alternate" content="en_US" />
        <meta name="og:site_name" content="SvenIT Blog" />
        <meta property="og:image" content={coverImage()} />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:site" content="SvenIT Blog" />
      </Head>
      <div
        style={{
          padding: "10px",
          display: "flex",
          alignItems: "center",
          position: "sticky",
          top: 0,
          zIndex: 99999,
          cursor: "pointer",
          background: "#18181f",
        }}
        onClick={() => router.push("/")}
        className={styles.container}
      >
        <div style={{ width: 55 }}>
          <Logo />
        </div>
        <div>
          <h2 style={{ margin: 0 }}>Sven's Blog</h2>
        </div>
      </div>
      <div>
        <div
          style={{ display: "flex", alignItems: "center" }}
          className={styles.container}
        >
          <h1 className={styles.name}>
            <Text text={page.properties.Name.title} />
          </h1>
        </div>
      </div>
      <article className={styles.container}>
        {coverImage() && (
          <a href={coverImage()} target="_blank">
            <img
              style={{ maxHeight: 200, width: "100%", objectFit: "cover" }}
              src={coverImage()}
            />
          </a>
        )}
        <section>
          {blocks.map((block) => (
            <Fragment key={block.id}>{renderBlock(block)}</Fragment>
          ))}
        </section>
        <div className="share u-hover-wrapper">
          <a
            className="share-item share-facebook u-hover-item"
            href={`https://www.facebook.com/sharer.php?u=${currentUrl}`}
            target="_blank"
            rel="noopener"
          >
            <svg
              viewBox="0 0 24 24"
              width="17"
              height="17"
              style={{ position: "relative", top: 3 }}
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
            </svg>
          </a>
          <a
            className="share-item share-twitter u-hover-item"
            href={`https://twitter.com/intent/tweet?url=${currentUrl}`}
            target="_blank"
            rel="noopener"
          >
            <svg
              viewBox="0 0 24 24"
              width="17"
              height="17"
              style={{ position: "relative", top: 3 }}
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
            </svg>
          </a>
        </div>
      </article>
    </div>
  );
}

export const getStaticPaths = async () => {
  const database = await getDatabase(databaseId);
  return {
    paths: database.map((page) => ({ params: { id: page.id } })),
    fallback: true,
  };
};

export const getStaticProps = async (context) => {
  const { id } = context.params;
  const page = await getPage(id);
  const blocks = await getBlocks(id);

  const childBlocks = await Promise.all(
    blocks
      .filter((block) => block.has_children)
      .map(async (block) => {
        return {
          id: block.id,
          children: await getBlocks(block.id),
        };
      })
  );
  const blocksWithChildren = blocks.map((block) => {
    if (block.has_children && !block[block.type].children) {
      block[block.type]["children"] = childBlocks.find(
        (x) => x.id === block.id
      )?.children;
    }
    return block;
  });

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  return {
    props: {
      page,
      blocks: blocksWithChildren,
      baseUrl,
    },
    revalidate: 1,
  };
};

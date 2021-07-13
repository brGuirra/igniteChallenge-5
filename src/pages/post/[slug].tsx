import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import Head from 'next/head';

import { FiCalendar } from 'react-icons/fi';
import { FiUser } from 'react-icons/fi';
import { FiClock } from 'react-icons/fi';

import Prismic from '@prismicio/client';
import PrismicDom from 'prismic-dom';

import { getPrismicClient } from '../../services/prismic';

import styles from './post.module.scss';
import { dateFormat } from '../../helper/dateFormat';
import { Comments } from '../../components/Comments';

interface Post {
  estimateReadingTime: number;
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      };
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  const router = useRouter();

  let wordsCounter = 0;

  const content = post.data.content.map(contentSection => {
    const text = PrismicDom.RichText.asHtml(contentSection.body);
    const words = PrismicDom.RichText.asText(contentSection.body)
      .trim()
      .split(/\s+/).length;

    wordsCounter += words;

    return {
      heading: contentSection.heading,
      body: {
        text,
      },
    };
  });

  const estimateReadingTime = Math.ceil(wordsCounter / 200);

  return (
    <>
      <Head>
        <title>Spacetraveling | {post.data.title}</title>
      </Head>
      <main>
        {router.isFallback ? (
          <div>Carregando...</div>
        ) : (
          <>
            <img className={styles.banner} src={post.data.banner.url} alt="" />
            <div className={styles.postContainer}>
              <h1>{post.data.title}</h1>
              <div className={styles.postInfo}>
                <time>
                  <FiCalendar />
                  {dateFormat(post.first_publication_date)}
                </time>
                <address>
                  <FiUser />
                  {post.data.author}
                </address>
                <span>
                  <FiClock />
                  <span>{estimateReadingTime} min</span>
                </span>
              </div>
              {content.map(section => (
                <div
                  className={styles.postSection}
                  key={section.heading + Math.floor(Math.random() * 100)}
                >
                  <h2>{section.heading}</h2>
                  {/* eslint-disable */}
                  <div
                    dangerouslySetInnerHTML={{ __html: section.body.text }}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </main>
      <section className={styles.commentSection}>
        <Comments />
      </section>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    [Prismic.Predicates.at('document.type', 'posts')],
    {
      pageSize: 10,
      fetch: ['posts.title'],
      orderings: '[document.last_publication_date]',
    }
  );

  const paths = posts.results.map(post => {
    return {
      params: { slug: String(post.uid) },
    };
  });

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      author: response.data.author,
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url,
      },
      content: response.data.content,
    },
  };

  return {
    props: {
      post,
    },
  };
};

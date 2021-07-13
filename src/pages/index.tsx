import { useState } from 'react';

import { GetStaticProps } from 'next';
import Link from 'next/link';
import Head from 'next/head';

import Prismic from '@prismicio/client';

import { FiCalendar } from 'react-icons/fi';
import { FiUser } from 'react-icons/fi';

import { getPrismicClient } from '../services/prismic';
import { dateFormat } from '../helper/dateFormat';
import { ExitPreviewButton } from '../components/exitPreviewButton';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
  preview: boolean;
}

export default function Home({
  postsPagination,
  preview,
}: HomeProps): JSX.Element {
  const [posts, setPosts] = useState(postsPagination);

  async function handleLoadMorePosts(url: string): Promise<void> {
    const newPostsResponse = await fetch(url)
      .then(response => response.json())
      .then(data => data);

    const newResults = newPostsResponse.results.map(post => {
      return {
        uid: post.uid,
        first_publication_date: dateFormat(post.first_publication_date),
        data: {
          title: post.data.title,
          subtitle: post.data.subtitle,
          author: post.data.author,
        },
      };
    });

    const updatedPostsPagination: PostPagination = {
      next_page: newPostsResponse.next_page,
      results: [...posts.results, ...newResults],
    };

    setPosts(updatedPostsPagination);
  }

  return (
    <>
      <Head>
        <title>Spacetraveling | Home</title>
      </Head>
      <main className={commonStyles.container}>
        <ul className={styles.postsList}>
          {posts.results.map(post => (
            <li key={post.uid}>
              <Link href={`/post/${post.uid}`}>
                <a className={styles.postLink}>
                  <strong>{post.data.title}</strong>
                  <p>{post.data.subtitle}</p>
                  <div className={styles.postDetails}>
                    <time>
                      <FiCalendar />
                      {dateFormat(post.first_publication_date)}
                    </time>
                    <address>
                      <FiUser />
                      {post.data.author}
                    </address>
                  </div>
                </a>
              </Link>
            </li>
          ))}
        </ul>
        {postsPagination.next_page === null ? (
          ''
        ) : (
          <button
            type="button"
            onClick={() => handleLoadMorePosts(postsPagination.next_page)}
            className={styles.loadMore}
          >
            Carregar mais posts
          </button>
        )}
      </main>
      {preview && <ExitPreviewButton />}
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({
  preview = false,
  previewData = {},
}) => {
  const prismic = await getPrismicClient();

  const postsResponse = await prismic.query(
    [Prismic.Predicates.at('document.type', 'posts')],
    {
      pageSize: 25,
      fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
      ref: previewData?.ref ?? null,
    }
  );

  const postsPagination = {
    next_page: postsResponse.next_page,
    results: postsResponse.results.map(post => {
      return {
        uid: post.uid,
        first_publication_date: post.first_publication_date,
        data: {
          title: post.data.title,
          subtitle: post.data.subtitle,
          author: post.data.author,
        },
      };
    }),
  };

  return {
    props: { postsPagination, preview },
  };
};

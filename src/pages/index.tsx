import { useState } from 'react';

import { GetStaticProps } from 'next';
import Prismic from '@prismicio/client';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { FiCalendar } from 'react-icons/fi';
import { FiUser } from 'react-icons/fi';

import Link from 'next/link';
import { getPrismicClient } from '../services/prismic';

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
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  const [posts, setPosts] = useState(postsPagination);

  async function handleLoadMorePosts(url: string): Promise<void> {
    const newPostsResponse = await fetch(url)
      .then(response => response.json())
      .then(data => data);

    const newResults: Post[] = newPostsResponse.results.map(post => {
      return {
        uid: post.uid,
        first_publication_date: post.first_publication_date,
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
    <main className={commonStyles.container}>
      <ul className={styles.postsList}>
        {posts.results.map(post => (
          <li className={styles.post} key={post.uid}>
            <Link href="/">
              <a>
                <strong>{post.data.title}</strong>
                <p>{post.data.subtitle}</p>
                <div className={styles.postDetails}>
                  <time>
                    <FiCalendar />
                    {format(
                      new Date(post.first_publication_date),
                      'dd MMM yyyy',
                      {
                        locale: ptBR,
                      }
                    )}
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
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.Predicates.at('document.type', 'posts')],
    {
      pageSize: 25,
      fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
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
    props: { postsPagination },
  };
};

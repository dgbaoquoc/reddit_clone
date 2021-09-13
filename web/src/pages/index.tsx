import Navbar from "../components/Navbar";
import { PostsDocument, usePostsQuery } from "../generated/graphql";
import { addApolloState, initializeApollo } from "../lib/apolloClient";
import Register from "./register";

const Index = () => {
  const { data, loading, error } = usePostsQuery();

  return (
    <>
      <Navbar />
      <ul>
        {data?.posts.map((post) => (
          <li>{post.title}</li>
        ))}
      </ul>
    </>
  );
};

export const getStaticProps = async () => {
  const apolloClient = initializeApollo();

  await apolloClient.query({
    query: PostsDocument,
  });

  return addApolloState(apolloClient, {
    props: {},
  });
};

export default Index;

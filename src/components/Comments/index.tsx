import { useUtterances } from '../../hooks/useUtterances';

const commentIdNode = 'comments';

export function Comments(): JSX.Element {
  useUtterances(commentIdNode);
  return <div id={commentIdNode} />;
}

import moment from 'moment';

export default function timeago([date]) {
  return moment(date).fromNow()
};

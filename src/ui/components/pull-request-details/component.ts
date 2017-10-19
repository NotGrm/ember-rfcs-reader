import Component, { tracked } from '@glimmer/component';
import Showdown from 'showdown';
const converter = new Showdown.Converter();

export default class PullRequestDetails extends Component {

  @tracked('args')
  get markdown() {
    if(this.args.pr) {
      return converter.makeHtml(this.args.pr.body)
    } else {
      return '';
    }
    
  }
};

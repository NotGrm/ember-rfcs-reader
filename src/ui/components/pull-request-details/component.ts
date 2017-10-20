import Component, { tracked } from '@glimmer/component';
import Showdown from 'showdown';
const converter = new Showdown.Converter();

export default class PullRequestDetails extends Component {
  @tracked state = {
    content: ''
  }

  @tracked('args')
  get markdown() {
    if(this.args.pr == undefined) {
      return ''
    }

    return converter.makeHtml(this.args.pr.body);
  }
};

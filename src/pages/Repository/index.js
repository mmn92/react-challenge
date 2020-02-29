import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

import api from '../../services/api';

import Container from '../../components/Container';
import { Loading, Owner, IssueList } from './styles';

export default class Repository extends Component {
  state = {
    repository: {},
    issues: [],
    issuesState: 'open',
    loading: true,
  };

  async componentDidMount() {
    const { match } = this.props;
    const { issuesState } = this.state;
    const repoName = decodeURIComponent(match.params.repository);

    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues`, {
        params: {
          state: issuesState,
          per_page: 5,
        },
      }),
    ]);

    this.setState({
      repository: repository.data,
      issues: issues.data,
      loading: false,
    });
  }

  handleClick = async issuesState => {
    this.setState({
      loading: true,
    });

    const { match } = this.props;

    const repoName = decodeURIComponent(match.params.repository);

    const issues = await api.get(`/repos/${repoName}/issues`, {
      params: {
        state: issuesState,
        per_page: 5,
      },
    });

    this.setState({
      issues: issues.data,
      issuesState,
      loading: false,
    });
  };

  loadMore = async () => {
    this.setState({
      loading: true,
    });

    const { match } = this.props;
    const { issuesState } = this.state;
    const repoName = decodeURIComponent(match.params.repository);

    const issues = await api.get(`/repos/${repoName}/issues`, {
      params: {
        state: issuesState,
        per_page: 5,
        page: 2,
      },
    });

    this.setState({
      issues: issues.data,
      issuesState,
      loading: false,
    });
  };

  render() {
    const { repository, issues, loading } = this.state;

    if (loading) {
      return <Loading>Carregando</Loading>;
    }

    return (
      <Container>
        <Owner>
          <Link to="/">Voltar</Link>
          <img src={repository.owner.avatar_url} alt={repository.owner.login} />
          <h1>{repository.name}</h1>
          <p>{repository.description}</p>
        </Owner>

        <IssueList>
          <button type="button" onClick={() => this.handleClick('open')}>
            open
          </button>
          <button type="button" onClick={() => this.handleClick('closed')}>
            closed
          </button>
          <button type="button" onClick={() => this.handleClick('all')}>
            all
          </button>

          {issues.map(issue => (
            <li key={String(issue.id)}>
              <img src={issue.user.avatar_url} alt={issue.user.login} />
              <div>
                <strong>
                  <a
                    href={issue.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {issue.title}
                  </a>
                  {issue.labels.map(label => (
                    <span key={String(label.id)}>{label.name}</span>
                  ))}
                </strong>
                <p>{issue.user.login}</p>
              </div>
            </li>
          ))}
        </IssueList>

        <button type="button">{'<'}</button>
        <button type="button">{'>'}</button>
      </Container>
    );
  }
}

Repository.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      repository: PropTypes.string,
    }),
  }).isRequired,
};

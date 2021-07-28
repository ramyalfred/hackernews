import logo from './logo.svg';
import loading from './assets/loading.svg'
import './App.css';
import { Component } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { render } from '@testing-library/react';


const DEFAULT_QUERY = 'redux';
const DEFAULT_HPP = '100';

const PATH_BASE = 'https://hn.algolia.com/api/v1';
const PATH_SEARCH = '/search';
const PARAM_SEARCH = 'query=';
const PARAM_PAGE = 'page=';
const PARAM_HPP = 'hitsPerPage=';

const list = [
  {
    title: 'React',
    url: 'https://facebook.github.io/react/',
    author: 'Jordan Walke',
    num_comments: 3,
    points: 4,
    objectID: 0,
  },
  {
    title: 'Redux',
    url: 'https://github.com/reactjs/redux',
    author: 'Dan Abramov, Andrew Clark',
    num_comments: 2,
    points: 5,
    objectID: 1,
  },
];

const largeColumn = {
  width: "40%",
};

const midColumn = {
  width: "30%",
};

const smallColumn = {
  width: "10%",
};

//const isSearched = searchTerm => item => item.title.toLowerCase().includes(searchTerm.toLowerCase());

class App extends Component {
  _isMounted = false;

  constructor(props){
    super(props);

    this.state = {
      results: null,
      searchKey: '',
      searchTerm: DEFAULT_QUERY,
      error: null,
      isLoading: false,
    };
    this.onDismiss = this.onDismiss.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
    this.onSearchSubmit = this.onSearchSubmit.bind(this);
    this.setSearchTopStories = this.setSearchTopStories.bind(this);
    this.fetchSearch = this.fetchSearch.bind(this);
  }

  needsToSearchTopStories(searchTerm){
    return !this.state.results[searchTerm];
  }

  setSearchTopStories(result){
    //Get the previous hits and page number from stored result
    const {hits,page} = result;

    //Get the current results object along with searchkey
    const {searchKey,results} = this.state;

    //If there is a cached hits list in the results object set it to oldHits
    const oldHits = results && results[searchKey]?
      results[searchKey].hits:
      []

    //Combine current hits with previously stored hits
    const updatedHits = [...oldHits,...hits];

    //Update the cache with the new results and stop the Loading indicator
    this.setState({
      results: {
        ...results,
        [searchKey]: {hits: updatedHits,page}
      },
      isLoading: false,
    });
  };

  onDismiss(id){
    const {searchKey, results} = this.state;
    const {hits,page} = results[searchKey];

    const isNotId = item => item.objectID !== id;
    const updatedList = hits.filter(isNotId);

    //Override the hits in the result object with the ones in this custom object
    this.setState({
        results: {
          ...results,
          [searchKey]: {hits: updatedList},
        }  
    });
  }

  onSearchChange(event){
    this.setState({searchTerm: event.target.value});
  }

  onSearchSubmit(event){
    event.preventDefault();
    const{searchTerm} = this.state;
    this.setState({searchKey: searchTerm});
    if(this.needsToSearchTopStories(searchTerm)){
      this.fetchSearch(searchTerm);
    };
    
  };

  render() {
    const {results,searchTerm,searchKey,error,isLoading} = this.state;
    const page = (results && results[searchKey] && results[searchKey].page) || 0;
    const list = (results && results[searchKey] && results[searchKey].hits) || [];
    
    return(
        <div className="page">
          <div className='interactions'>
            <Search 
              value={searchTerm}
              onChange={this.onSearchChange}
              onSubmit={this.onSearchSubmit}
            >
              Search
            </Search>
          </div>
          {error?
            <div className='interactions'>
              <p>Something went wrong.</p>
            </div>
            :<Table
              list={list}
              onDismiss={this.onDismiss}
            />}
            <ButtonWithLoading
              isLoading = {isLoading}
              onClick = {() => this.fetchSearch(searchKey,page+1)}>
                More
            </ButtonWithLoading>
        </div>
    );
  }

  fetchSearch(searchTerm,page = 0){
    //Start loading indicator as the page loads
    this.setState({isLoading: true});

    //Fetch the URL using axios library
    axios(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}&${PARAM_HPP}${DEFAULT_HPP}`)
      .then(result => this._isMounted && this.setSearchTopStories(result.data))
      .catch(error => this._isMounted && this.setState({error}));
  }

  componentDidMount(){
    this._isMounted = true;

    const{searchTerm} = this.state;
    this.setState({searchKey: searchTerm});
    this.fetchSearch(searchTerm);
  }

  componentWillUnmount(){
    this._isMounted = false;
  }
}

//Refractor Search into an ES6 class component
class Search extends Component{

  constructor(props){
    super(props);
  }

    render(){
      const {value,onChange,onSubmit,children} = this.props;
      return(
        <form onSubmit={onSubmit}>
          {children}
          <input 
            type="text"
            onChange={onChange}
            value={value}
            ref={(node) => {this.input = node}}
          />
          <button type='submit'>
              {children}
            </button>
      </form>
      );
    }

    componentDidMount(){
      if(this.input){
        this.input.focus();
      }
    }
}

Search.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
}

const Table = ({list,onDismiss}) =>
  <div className='table'>
  {list.map(item => 
    <div key={item.objectID} className='table-row'>
      <span style={largeColumn}>
        <a href={item.url}>{item.title}</a>
      </span>
      <span style={midColumn}>{item.author}</span>
      <span style={smallColumn}>{item.num_comments}</span>
      <span style={smallColumn}>{item.points}</span>
      <span style={smallColumn}>
        <Button 
          onClick={() => onDismiss(item.objectID)}
          className='button-inline'
        >
          Dismiss
        </Button>
      </span>
    </div>  
  )}
  </div>

// Defining types for Table props
Table.propTypes = {
  //Defining list in details
  list: PropTypes.arrayOf(
    PropTypes.shape({
      objectID: PropTypes.string.isRequired,
      author: PropTypes.string,
      url: PropTypes.string,
      num_comments: PropTypes.number,
      points: PropTypes.number,
    })    
  ).isRequired,
  onDismiss: PropTypes.func.isRequired
}

const Button = ({onClick,className='',children}) =>
  <button
    type='button'
    className={className}
    onClick={() => onClick()}
  >
    {children}
  </button>

Button.defaultProps = {
  className: '',
};

Button.propTypes = {
  onClick: PropTypes.func.isRequired,
  className: PropTypes.string,
  children: PropTypes.node.isRequired
};

const Loading = () =>
<img src={loading} alt='Loading...'/>

const withLoading = (Component) => ({isLoading, ...rest}) => 
  isLoading
    ? <Loading />
    : <Component {...rest}/>

const ButtonWithLoading = withLoading(Button);

export default App;

export{
  Button,
  Search,
  Table,
};

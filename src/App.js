import logo from './logo.svg';
import loading from './assets/loading.svg'
import './App.css';
import { Component } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';

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

    //Update the cache with the new results
    this.setState({
      results: {
        ...results,
        [searchKey]: {hits: updatedHits,page}
      }
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
    const {results,searchTerm,searchKey,error} = this.state;
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
          <Button onClick = {() => this.fetchSearch(searchKey,page+1)}>
            More
          </Button>
        </div>
    );
  }

  fetchSearch(searchTerm,page = 0){

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

const Search = ({value,onChange,onSubmit,children}) => 
    <form onSubmit={onSubmit}>
      {children}
      <input 
        type="text"
        onChange={onChange}
        value={value}
      />
      <button type='submit'>
          {children}
        </button>
    </form>


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

Table.propTypes = {
  list: PropTypes.array.isRequired,
  onDismiss: PropTypes.func.isRequired,
};


const Button = ({onClick,className='',children}) =>
  <button
    type='button'
    className={className}
    onClick={() => onClick()}
  >
    {children}
  </button>

Button.propTypes = {
  OnClick: PropTypes.func.isRequired,
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};

const Loading = () =>
<img src={loading} alt='loading...'/>

export default App;

export{
  Button,
  Search,
  Table,
};

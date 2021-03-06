import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';

import ReactTable from 'react-table';
import 'react-table/react-table.css';
import Typography from '@material-ui/core/Typography';

const styles = theme => ({
  root: {
    padding: '10px',
    overflowX: 'auto',
  },
  title: {
    fontSize: 16,
    margin: theme.spacing.unit,
  },
});

let id = 0;

class TransactionTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: this.getData(),
    };
  }

  getData = () => {
    const { transactions } = this.props;
    return transactions.map(({ account, name, date, amount, category }) => {
      return this.createData(account, name, date, amount, category);
    });
  };

  createData = (account, name, date, amount, category, location) => {
    id += 1;
    return { id, account, name, date, amount, category, location };
  }

  render() {
    const { classes } = this.props;
    const { data } = this.state;

    return (
      <Paper className={classes.root}>
        <Typography className={classes.title} color="textSecondary" gutterBottom>
          Transactions
        </Typography>
        <ReactTable
          data={data}
          columns={[
            {
              Header: 'Name',
              accessor: 'name',
            },
            {
              Header: 'Date',
              accessor: 'date',
            },
            {
              Header: 'Amount',
              accessor: 'amount',
            },
            {
              Header: 'Category',
              id: 'catogory',
              accessor: d => d.category[1] || d.category[0],
            },
          ]}
          defaultPageSize={10}
          className="-striped -highlight"
        />
      </Paper>
    );
  }
}

export default withStyles(styles)(TransactionTable);

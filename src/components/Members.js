import React, { useState, useEffect } from 'react';
import ReactPaginate from 'react-paginate';

import "./Members.css";

import MemberService from '../services/MemberService';

import MembersTable from './MembersTable';

function AdminMembers()  {

    const [membersList, setMembersList] = useState();

    const [pagination, setPagination] = useState({
        data: [],
        offset: 0,
        numberPerPage: 10,
        pageCount: 0,
        currentData: []
      });

    const getData = () => {
      return MemberService.getMembers();
    };

    useEffect(() => {
      if (membersList && membersList.length >= 0) {
        setPagination((prevState) => ({
          ...prevState,
          data: membersList,
          pageCount: membersList.length / prevState.numberPerPage,
          currentData: membersList.slice(pagination.offset, pagination.offset + pagination.numberPerPage)
        }));
      } else {
        getData()
        .then(response => response.json())
        .then((membersList) => {
            setMembersList(membersList);
            setPagination((prevState) => ({
              ...prevState,
              data: membersList,
              pageCount: membersList.length / prevState.numberPerPage,
              currentData: membersList.slice(pagination.offset, pagination.offset + pagination.numberPerPage)
            }));
        });
      }
    }, [pagination.numberPerPage, pagination.offset]);
    
      const handlePageClick = event => {
        const selected = event.selected;
        const offset = selected * pagination.numberPerPage
        setPagination({ 
          ...pagination,
          offset,
          currentData: pagination.data.slice(offset, offset + pagination.numberPerPage)
        })
      }

      const dataUpdate = (data) => {
        let records = membersList;
        records = records.map((d) => {
            if (d.id === data.id) {
                d = data;
            }
            return d;
        });
        setMembersList(records);
        setPagination({
          ...pagination,
          data: records,
          currentData: records.slice(pagination.offset, pagination.offset + pagination.numberPerPage)
        });
      }

      const deleteRecords = (dataIds = []) => {
        if (dataIds.length > 0) {
          for (let i=0; i<membersList.length-1; i++) {
            if (dataIds.indexOf(membersList[i].id) > -1) {
              membersList.splice(i, 1);
              i--;
            }
          }
          setMembersList(membersList);
          setPagination({
            ...pagination,
            data: membersList,
            currentData: membersList.slice(pagination.offset, pagination.offset + pagination.numberPerPage)
          });
        }
      }

      return (
        <div>
          {pagination.currentData.length > 0 && <MembersTable 
                                                    data={pagination.currentData} 
                                                    offset={pagination.offset}
                                                    dataUpdate={dataUpdate}
                                                    deleteRecords={deleteRecords}/>}
          <ReactPaginate
            previousLabel={'Previous'}
            nextLabel={'Next'}
            breakLabel={'...'}
            pageCount={pagination.pageCount}
            marginPagesDisplayed={2}
            pageRangeDisplayed={5}
            onPageChange={handlePageClick}
            containerClassName={'pagination'}
            activeClassName={'active'}
          />
        </div>
      );
}

export default AdminMembers;
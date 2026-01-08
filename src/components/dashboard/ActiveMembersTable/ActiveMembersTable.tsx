import { useState } from 'react';
import { Search, ArrowUpDown, MoreVertical } from 'lucide-react';
import type { ActiveMember } from '../../../types/index.ts';
import './ActiveMembersTable.css';

interface ActiveMembersTableProps {
  members: ActiveMember[];
  title?: string;
}

function ActiveMembersTable({ members, title = 'Active Members' }: ActiveMembersTableProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="members-table">
      <h3 className="members-table__title">{title}</h3>
      <div className="members-table__controls">
        <div className="members-table__search">
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="members-table__search-input"
          />
          <Search size={18} className="members-table__search-icon" />
        </div>
        <button className="members-table__sort-btn">
          Sort by <ArrowUpDown size={16} />
        </button>
      </div>
      <div className="members-table__wrapper">
        <table className="members-table__table">
          <thead>
            <tr>
              <th></th>
              <th>Date paid</th>
              <th>Date Expiry</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredMembers.map((member) => (
              <tr key={member.id}>
                <td>
                  <div className="members-table__member">
                    <div className="members-table__avatar">
                      {member.avatar ? (
                        <img src={member.avatar} alt={member.name} />
                      ) : (
                        <span>{member.name.charAt(0)}</span>
                      )}
                    </div>
                    <span className="members-table__name">{member.name}</span>
                  </div>
                </td>
                <td>{member.datePaid}</td>
                <td>{member.dateExpiry}</td>
                <td>
                  <span className={`members-table__status members-table__status--${member.status}`}>
                    <span className="members-table__status-dot"></span>
                    {member.status === 'active' ? 'Active' : 'Expired'}
                  </span>
                </td>
                <td>
                  <button className="members-table__action-btn">
                    <MoreVertical size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ActiveMembersTable;

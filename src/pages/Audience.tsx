import React from 'react';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable} from '@tanstack/react-table';
import type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState} from '@tanstack/react-table';
import { Activity, ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Download, Globe, MoreHorizontal, Search, TrendingUp, UserCheck, UserPlus, Users } from 'lucide-react';


// Mock data type
interface Viewer {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive' | 'blocked';
  joinDate: string;
  lastActive: string;
  watchTime: number;
  streams: number;
  location: string;
  engagement: number;
}

// Mock data
const data: Viewer[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    status: 'active',
    joinDate: '2024-01-15',
    lastActive: '2024-01-28',
    watchTime: 145,
    streams: 23,
    location: 'United States',
    engagement: 89},
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    status: 'active',
    joinDate: '2023-12-20',
    lastActive: '2024-01-27',
    watchTime: 98,
    streams: 15,
    location: 'Canada',
    engagement: 76},
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob.johnson@example.com',
    status: 'inactive',
    joinDate: '2023-11-10',
    lastActive: '2024-01-10',
    watchTime: 45,
    streams: 8,
    location: 'United Kingdom',
    engagement: 45},
  {
    id: '4',
    name: 'Alice Williams',
    email: 'alice.williams@example.com',
    status: 'active',
    joinDate: '2024-01-01',
    lastActive: '2024-01-28',
    watchTime: 234,
    streams: 42,
    location: 'Australia',
    engagement: 92},
  {
    id: '5',
    name: 'Charlie Brown',
    email: 'charlie.brown@example.com',
    status: 'blocked',
    joinDate: '2023-10-05',
    lastActive: '2023-12-15',
    watchTime: 12,
    streams: 3,
    location: 'Germany',
    engagement: 15},
];

// Column definitions
const columns: ColumnDef<Viewer>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => {
      return (
        <button
          style={{ ...styles.button, backgroundColor: 'transparent', border: 'none', padding: '4px 8px' }}
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Name
          <ChevronDown style={{ width: '16px', height: '16px', marginLeft: '8px' }} />
        </button>
      );
    },
    cell: ({ row }) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={styles.avatar}>
          {row.getValue<string>('name').charAt(0)}
        </div>
        <div>
          <div style={{ fontWeight: '500', color: '#ffffff' }}>{row.getValue('name')}</div>
          <div style={{ fontSize: '14px', color: '#9ca3af' }}>{row.original.email}</div>
        </div>
      </div>
    )},
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue<string>('status');
      const badgeStyle = status === 'active' 
        ? styles.badgeActive 
        : status === 'inactive' 
        ? styles.badgeInactive 
        : styles.badgeBlocked;
      return (
        <span style={{ ...styles.badge, ...badgeStyle }}>
          {status}
        </span>
      );
    }},
  {
    accessorKey: 'location',
    header: ({ column }) => {
      return (
        <button
          style={{ ...styles.button, backgroundColor: 'transparent', border: 'none', padding: '4px 8px' }}
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          <Globe style={{ width: '16px', height: '16px', marginRight: '8px' }} />
          Location
          <ChevronDown style={{ width: '16px', height: '16px', marginLeft: '8px' }} />
        </button>
      );
    },
    cell: ({ row }) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Globe style={{ width: '16px', height: '16px', color: '#9ca3af' }} />
        <span style={{ color: '#ffffff' }}>{row.getValue('location')}</span>
      </div>
    )},
  {
    accessorKey: 'watchTime',
    header: ({ column }) => {
      return (
        <button
          style={{ ...styles.button, backgroundColor: 'transparent', border: 'none', padding: '4px 8px' }}
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Watch Time
          <ChevronDown style={{ width: '16px', height: '16px', marginLeft: '8px' }} />
        </button>
      );
    },
    cell: ({ row }) => {
      const minutes = row.getValue<number>('watchTime');
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return <div style={{ color: '#ffffff' }}>{hours}h {mins}m</div>;
    }},
  {
    accessorKey: 'streams',
    header: 'Streams',
    cell: ({ row }) => (
      <div style={{ textAlign: 'center', color: '#ffffff' }}>{row.getValue('streams')}</div>
    )},
  {
    accessorKey: 'engagement',
    header: ({ column }) => {
      return (
        <button
          style={{ ...styles.button, backgroundColor: 'transparent', border: 'none', padding: '4px 8px' }}
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          <Activity style={{ width: '16px', height: '16px', marginRight: '8px' }} />
          Engagement
          <ChevronDown style={{ width: '16px', height: '16px', marginLeft: '8px' }} />
        </button>
      );
    },
    cell: ({ row }) => {
      const engagement = row.getValue<number>('engagement');
      const fillColor = engagement > 80
        ? '#10b981'
        : engagement > 50
        ? '#eab308'
        : '#ef4444';
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={styles.progressBar}>
            <div
              style={{ 
                ...styles.progressFill, 
                width: `${engagement}%`,
                backgroundColor: fillColor
              }}
            />
          </div>
          <span style={{ fontSize: '14px', color: '#ffffff' }}>{engagement}%</span>
        </div>
      );
    }},
  {
    accessorKey: 'lastActive',
    header: 'Last Active',
    cell: ({ row }) => {
      const date = new Date(row.getValue<string>('lastActive'));
      const daysAgo = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
      return (
        <div style={{ color: '#9ca3af' }}>
          {daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo} days ago`}
        </div>
      );
    }},
  {
    id: 'actions',
    cell: () => {
      return (
        <button style={{ ...styles.button, backgroundColor: 'transparent', border: 'none', padding: '8px' }}>
          <MoreHorizontal style={{ width: '16px', height: '16px' }} />
        </button>
      );
    }},
];

export default function AudiencePage() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const styles = {
    container: {
      backgroundColor: '#0a0a0a',
      minHeight: '100vh',
      padding: '32px'},
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '32px'},
    title: {
      fontSize: '30px',
      fontWeight: 'bold',
      color: '#ffffff',
      letterSpacing: '-0.025em'},
    subtitle: {
      color: '#9ca3af',
      marginTop: '4px'},
    card: {
      backgroundColor: '#121212',
      borderRadius: '12px',
      border: '1px solid #262626',
      overflow: 'hidden'},
    cardHeader: {
      padding: '24px',
      borderBottom: '1px solid #262626'},
    cardTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#ffffff',
      marginBottom: '4px'},
    cardDescription: {
      fontSize: '14px',
      color: '#9ca3af'},
    cardContent: {
      padding: '24px'},
    statCard: {
      backgroundColor: '#121212',
      borderRadius: '12px',
      border: '1px solid #262626',
      padding: '24px'},
    statHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '12px'},
    statTitle: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#9ca3af'},
    statValue: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#ffffff',
      marginBottom: '4px'},
    statChange: {
      fontSize: '12px',
      color: '#9ca3af'},
    statChangePositive: {
      color: '#10b981'},
    button: {
      backgroundColor: '#1f1f1f',
      border: '1px solid #374151',
      borderRadius: '8px',
      padding: '8px 16px',
      fontSize: '14px',
      color: '#ffffff',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'all 0.2s'},
    buttonPrimary: {
      background: 'linear-gradient(to right, #a855f7, #ec4899)',
      border: 'none'},
    searchInput: {
      backgroundColor: '#1f1f1f',
      border: '1px solid #374151',
      borderRadius: '8px',
      padding: '8px 16px 8px 40px',
      fontSize: '14px',
      color: '#ffffff',
      outline: 'none',
      width: '100%',
      maxWidth: '24rem'},
    table: {
      width: '100%',
      borderCollapse: 'collapse' as const},
    tableHeader: {
      backgroundColor: '#1a1a1a',
      borderBottom: '1px solid #262626'},
    tableRow: {
      borderBottom: '1px solid #262626'},
    tableCell: {
      padding: '16px',
      color: '#ffffff',
      fontSize: '14px'},
    badge: {
      padding: '4px 8px',
      borderRadius: '6px',
      fontSize: '12px',
      fontWeight: '500'},
    badgeActive: {
      backgroundColor: '#10b981',
      color: '#ffffff'},
    badgeInactive: {
      backgroundColor: '#374151',
      color: '#9ca3af'},
    badgeBlocked: {
      backgroundColor: '#ef4444',
      color: '#ffffff'},
    progressBar: {
      width: '80px',
      height: '8px',
      backgroundColor: '#1f1f1f',
      borderRadius: '4px',
      overflow: 'hidden'},
    progressFill: {
      height: '100%',
      borderRadius: '4px',
      transition: 'width 0.3s ease'},
    avatar: {
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      backgroundColor: '#374151',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '14px',
      fontWeight: '600',
      color: '#e5e7eb'},
    pagination: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: '16px',
      color: '#9ca3af',
      fontSize: '14px'}};

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection}});

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Audience</h1>
          <p style={styles.subtitle}>Manage and analyze your viewer base</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button style={styles.button}>
            <Mail style={{ width: '16px', height: '16px' }} />
            Message All
          </button>
          <button style={styles.button}>
            <Download style={{ width: '16px', height: '16px' }} />
            Export
          </button>
          <button style={{ ...styles.button, ...styles.buttonPrimary }}>
            <UserPlus style={{ width: '16px', height: '16px' }} />
            Invite Viewers
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', marginBottom: '32px' }}>
        <div style={styles.statCard}>
          <div style={styles.statHeader}>
            <h3 style={styles.statTitle}>Total Viewers</h3>
            <Users style={{ width: '16px', height: '16px', color: '#9ca3af' }} />
          </div>
          <div>
            <div style={styles.statValue}>12,234</div>
            <p style={styles.statChange}>
              <span style={styles.statChangePositive}>+15%</span> from last month
            </p>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statHeader}>
            <h3 style={styles.statTitle}>Active Viewers</h3>
            <UserCheck style={{ width: '16px', height: '16px', color: '#9ca3af' }} />
          </div>
          <div>
            <div style={styles.statValue}>8,921</div>
            <p style={styles.statChange}>72.9% of total viewers</p>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statHeader}>
            <h3 style={styles.statTitle}>New This Month</h3>
            <TrendingUp style={{ width: '16px', height: '16px', color: '#9ca3af' }} />
          </div>
          <div>
            <div style={styles.statValue}>1,234</div>
            <p style={styles.statChange}>
              <span style={styles.statChangePositive}>+28%</span> growth rate
            </p>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statHeader}>
            <h3 style={styles.statTitle}>Avg. Engagement</h3>
            <Activity style={{ width: '16px', height: '16px', color: '#9ca3af' }} />
          </div>
          <div>
            <div style={styles.statValue}>68.3%</div>
            <p style={styles.statChange}>
              <span style={styles.statChangePositive}>+2.4%</span> from last month
            </p>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <h2 style={styles.cardTitle}>Viewer Directory</h2>
          <p style={styles.cardDescription}>A complete list of all your viewers and their engagement metrics</p>
        </div>
        <div style={styles.cardContent}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Search and Filters */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ position: 'relative', flex: 1, maxWidth: '24rem' }}>
                <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#9ca3af' }} />
                <input
                  style={styles.searchInput}
                  placeholder="Search viewers..."
                  value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
                  onChange={(event) =>
                    table.getColumn('name')?.setFilterValue(event.target.value)
                  }
                />
              </div>
              <button style={styles.button}>
                Status <ChevronDown style={{ width: '16px', height: '16px' }} />
              </button>
              <button style={styles.button}>
                Location <ChevronDown style={{ width: '16px', height: '16px' }} />
              </button>
            </div>

            {/* Table */}
            <div style={{ borderRadius: '8px', border: '1px solid #262626', overflow: 'hidden' }}>
              <table style={styles.table}>
                <thead style={styles.tableHeader}>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id} style={styles.tableRow}>
                      {headerGroup.headers.map((header) => {
                        return (
                          <th key={header.id} style={{ ...styles.tableCell, fontWeight: '600', textAlign: 'left' }}>
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                          </th>
                        );
                      })}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <tr
                        key={row.id}
                        style={{ ...styles.tableRow, backgroundColor: row.getIsSelected() ? '#1f1f1f' : 'transparent' }}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id} style={styles.tableCell}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={columns.length}
                        style={{ ...styles.tableCell, height: '96px', textAlign: 'center', color: '#9ca3af' }}
                      >
                        No results.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div style={styles.pagination}>
              <div style={{ fontSize: '14px' }}>
                {table.getFilteredSelectedRowModel().rows.length} of{' '}
                {table.getFilteredRowModel().rows.length} row(s) selected.
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  style={{ ...styles.button, padding: '6px 12px', opacity: !table.getCanPreviousPage() ? 0.5 : 1, cursor: !table.getCanPreviousPage() ? 'not-allowed' : 'pointer' }}
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                >
                  <ChevronsLeft style={{ width: '16px', height: '16px' }} />
                </button>
                <button
                  style={{ ...styles.button, padding: '6px 12px', opacity: !table.getCanPreviousPage() ? 0.5 : 1, cursor: !table.getCanPreviousPage() ? 'not-allowed' : 'pointer' }}
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  <ChevronLeft style={{ width: '16px', height: '16px' }} />
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '14px' }}>Page</span>
                  <span style={{ fontSize: '14px', fontWeight: '500' }}>
                    {table.getState().pagination.pageIndex + 1} of{' '}
                    {table.getPageCount()}
                  </span>
                </div>
                <button
                  style={{ ...styles.button, padding: '6px 12px', opacity: !table.getCanNextPage() ? 0.5 : 1, cursor: !table.getCanNextPage() ? 'not-allowed' : 'pointer' }}
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  <ChevronRight style={{ width: '16px', height: '16px' }} />
                </button>
                <button
                  style={{ ...styles.button, padding: '6px 12px', opacity: !table.getCanNextPage() ? 0.5 : 1, cursor: !table.getCanNextPage() ? 'not-allowed' : 'pointer' }}
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                >
                  <ChevronsRight style={{ width: '16px', height: '16px' }} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Geographic Distribution */}
      <div style={{ ...styles.card, marginTop: '32px' }}>
        <div style={styles.cardHeader}>
          <h2 style={styles.cardTitle}>Geographic Distribution</h2>
          <p style={styles.cardDescription}>Where your viewers are located</p>
        </div>
        <div style={styles.cardContent}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { country: 'United States', viewers: 4532, percentage: 37 },
              { country: 'Canada', viewers: 2341, percentage: 19 },
              { country: 'United Kingdom', viewers: 1876, percentage: 15 },
              { country: 'Australia', viewers: 1234, percentage: 10 },
              { country: 'Germany', viewers: 987, percentage: 8 },
              { country: 'Others', viewers: 1264, percentage: 11 },
            ].map((location) => (
              <div key={location.country} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Globe style={{ width: '16px', height: '16px', color: '#9ca3af' }} />
                  <span style={{ fontWeight: '500', color: '#ffffff' }}>{location.country}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{ fontSize: '14px', color: '#9ca3af' }}>
                    {location.viewers.toLocaleString()} viewers
                  </span>
                  <div style={{ ...styles.progressBar, width: '128px' }}>
                    <div
                      style={{ 
                        ...styles.progressFill, 
                        width: `${location.percentage}%`,
                        backgroundColor: '#a855f7'
                      }}
                    />
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: '500', width: '40px', textAlign: 'right', color: '#ffffff' }}>
                    {location.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
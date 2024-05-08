init_db() {
  local thisdir
  thisdir=$(dirname ${BASH_SOURCE[0]})
  log_info "Initializing the database..."
  mysql $mysql_flags ${MYSQL_DATABASE} < $thisdir/init_db.sql
}

if ! [ -v MYSQL_RUNNING_AS_SLAVE ] && $MYSQL_DATADIR_FIRST_INIT ; then
  init_db
fi
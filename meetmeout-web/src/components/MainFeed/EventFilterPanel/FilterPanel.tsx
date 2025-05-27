import styles from "./../MainFeed.module.css";

interface FilterPanelProps {
  setGlobalFilter: (filter: string) => void;
  showPastEvents: boolean;
  setShowPastEvents: (val: boolean) => void;
  onSortChange: (value: string) => void;
}

const FilterPanel = ({
  setGlobalFilter,
  showPastEvents,
  setShowPastEvents,
  onSortChange
}: FilterPanelProps) => {
  return (
    <div className={styles.mainFeedContainerFilter}>
      <div className={styles.selections}>
        <label onClick={() => setGlobalFilter("All Events")}>
          All Available Events                    
        </label>
        <label onClick={() => setGlobalFilter("My Events")}>
          My Events
        </label>
        <label onClick={() => setGlobalFilter("My Drafts")}>
          My Drafts
        </label>
        <label className={styles.toggleWrapper}>
          <input
            type="checkbox"
            checked={showPastEvents}
            onChange={(e) => setShowPastEvents(e.target.checked)}
          />
          <span className={styles.slider}></span>
          <span className={styles.labelText}>
            {showPastEvents ? "Showing past events" : "Hide past events"}
          </span>
        </label>
      </div>
      <div className={styles.sort}>
        <select onChange={(e) => onSortChange(e.target.value)}>
          <option value="Soonest">Soonest</option>
          <option value="Latest">Latest</option>
          <option value="Recently Added">Recently Added</option>
          <option value="Most Liked">Most Liked</option>
          <option value="Most Attended">Most Attended</option>
          <option value="Nearest">Nearest</option>
        </select>
      </div>
    </div>
  );
};

export default FilterPanel;

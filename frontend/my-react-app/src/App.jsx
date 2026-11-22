import { useEffect, useMemo, useState } from "react";
import "./index.css";

const API = "http://localhost:3001/api/items";

function App() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [selectedItem, setSelectedItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formStatus, setFormStatus] = useState("Lost");
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    category: "",
    location: "",
    date: "",
    description: "",
  });

  async function loadItems() {
    try {
      setError("");

      const response = await fetch(API);

      if (!response.ok) {
        throw new Error("Unable to load reports.");
      }

      const data = await response.json();

      setItems(
        data.filter(
          (item) =>
            item.name &&
            item.category &&
            ["Lost", "Found", "Returned"].includes(item.status)
        )
      );
    } catch {
      setError(
        "Cannot connect to FoundLink. Please start your backend server."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadItems();
  }, []);

  const stats = useMemo(
    () => [
      {
        label: "Total Reports",
        value: items.length,
        filter: "All Statuses",
      },
      {
        label: "Lost Items",
        value: items.filter((item) => item.status === "Lost").length,
        filter: "Lost",
      },
      {
        label: "Found Items",
        value: items.filter((item) => item.status === "Found").length,
        filter: "Found",
      },
      {
        label: "Returned Items",
        value: items.filter((item) => item.status === "Returned").length,
        filter: "Returned",
      },
    ],
    [items]
  );

  const categories = [
    ...new Set(items.map((item) => item.category).filter(Boolean)),
  ];

  const filteredItems = items.filter((item) => {
    const searchText = search.toLowerCase();

    const matchesSearch = [
      item.name,
      item.category,
      item.location,
      item.description,
    ].some((value) => (value || "").toLowerCase().includes(searchText));

    const matchesCategory =
      category === "All Categories" || item.category === category;

    const matchesStatus =
      statusFilter === "All Statuses" || item.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  function selectStat(filter) {
    setStatusFilter(filter);
    document.getElementById("reports")?.scrollIntoView({
      behavior: "smooth",
    });
  }

  function openReport(status) {
    setFormStatus(status);
    setForm({
      name: "",
      category: "",
      location: "",
      date: "",
      description: "",
    });
    setShowForm(true);

    setTimeout(() => {
      document.getElementById("report-form")?.scrollIntoView({
        behavior: "smooth",
      });
    }, 100);
  }

  async function submitReport(event) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const response = await fetch(API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          status: formStatus,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Could not submit report.");
      }

      setItems((previous) => [result, ...previous]);
      setShowForm(false);
      setStatusFilter("All Statuses");
      setCategory("All Categories");
      setSearch("");
    } catch (err) {
      setError(err.message || "Unable to submit the report.");
    } finally {
      setSaving(false);
    }
  }

  async function markReturned(item) {
    try {
      const response = await fetch(`${API}/${item.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "Returned" }),
      });

      if (!response.ok) {
        throw new Error("Unable to update report.");
      }

      const updatedItem = await response.json();

      setItems((previous) =>
        previous.map((entry) =>
          entry.id === updatedItem.id ? updatedItem : entry
        )
      );

      setSelectedItem(updatedItem);
    } catch (err) {
      setError(err.message);
    }
  }

  async function deleteReport(item) {
    if (!window.confirm("Are you sure you want to delete this report?")) {
      return;
    }

    try {
      const response = await fetch(`${API}/${item.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Unable to delete report.");
      }

      setItems((previous) =>
        previous.filter((entry) => entry.id !== item.id)
      );

      setSelectedItem(null);
    } catch (err) {
      setError(err.message);
    }
  }

  function itemIcon(category = "") {
    const value = category.toLowerCase();

    if (value.includes("electronic")) return "📱";
    if (value.includes("bag")) return "🎒";
    if (value.includes("book")) return "📚";
    if (value.includes("cloth")) return "👕";
    if (value.includes("document")) return "📄";
    if (value.includes("accessor")) return "⌚";

    return "🎒";
  }

  return (
    <div className="app">
      
      <header className="navbar">
        <a className="logo" href="#home">
          <span className="logo-icon">F</span>
          <span>FoundLink</span>
        </a>

        <nav className="nav-links">
          <a href="#home">Home</a><br />
          <a href="#reports">Browse Items</a><br />
          <a href="#about">About</a>
        </nav>

        <button className="nav-button" onClick={() => openReport("Lost")}>
          + Report Item
        </button>
      </header>

      <main>
      
        <section className="hero" id="home">
          <div className="hero-inner">
            <div className="hero-text">
              <span className="eyebrow">
                YOUR CAMPUS LOST &amp; FOUND PORTAL
              </span>

              <h1>
                Lost Something?
                <br />
                <span>Let's Find It Together.</span>
              </h1>

              <p>
                Reconnect with your lost belongings through a simple,
                reliable campus lost-and-found platform.
              </p>

              <div className="hero-buttons">
                <button
                  className="button-primary"
                  onClick={() =>
                    document.getElementById("reports")?.scrollIntoView({
                      behavior: "smooth",
                    })
                  }
                >
                  Find an Item
                </button>

                <button
                  className="button-secondary"
                  onClick={() => openReport("Lost")}
                >
                  Report Lost Item
                </button>

                <button
                  className="button-secondary"
                  onClick={() => openReport("Found")}
                >
                  Report Found Item
                </button>
              </div>
            </div>

            <div className="hero-card">
              <div className="hero-emoji">🎒</div>

              <h2>Every Item Has a Way Home</h2>

              <p>
                Search reports, discover possible matches, and help reconnect
                people with their belongings.
              </p>

              <div className="hero-card-footer">
                <span>✓ Easy to use</span>
                <span>✓ Community focused</span>
              </div>
            </div>
          </div>
        </section>

      
        <section className="stats-section">
          <div className="stats-grid">
            {stats.map((stat) => (
              <button
                className={`stat-card ${
                  statusFilter === stat.filter ? "stat-active" : ""
                }`}
                key={stat.label}
                onClick={() => selectStat(stat.filter)}
              >
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </button>
            ))}
          </div>
        </section>

        
        {showForm && (
          <section className="form-section" id="report-form">
            <div className="form-card">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">CAMPUS COMMUNITY</span>
                  <h2>Report an Item</h2>
                  <p>Provide the details so others can identify the item.</p>
                </div>

                <button
                  className="close-button"
                  onClick={() => setShowForm(false)}
                  aria-label="Close report form"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={submitReport}>
                <div className="form-grid">
                  <label>
                    Item Name *
                    <input
                      required
                      maxLength={100}
                      placeholder="e.g. Blue water bottle"
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                    />
                  </label><br /><br />

                  <label>
                    Category *
                    <select
                      required
                      value={form.category}
                      onChange={(e) =>
                        setForm({ ...form, category: e.target.value })
                      }
                    >
                      <option value="">Select category</option>
                      <option>Electronics</option>
                      <option>Bags</option>
                      <option>Books</option>
                      <option>Clothing</option>
                      <option>Documents</option>
                      <option>Accessories</option>
                      <option>Other</option>
                    </select>
                  </label><br /><br />

                  <label>
                    Location *
                    <input
                      required
                      maxLength={150}
                      placeholder="Where was it lost or found?"
                      value={form.location}
                      onChange={(e) =>
                        setForm({ ...form, location: e.target.value })
                      }
                    />
                  </label><br /><br />

                  <label>
                    Date *
                    <input
                      required
                      type="date"
                      max={new Date().toLocaleDateString("en-CA")}
                      value={form.date}
                      onChange={(e) =>
                        setForm({ ...form, date: e.target.value })
                      }
                    />
                  </label><br /><br />

                  <label className="full-width">
                    Description
                    <textarea
                      maxLength={1000}
                      placeholder="Add colour, brand, or other identifying details..."
                      value={form.description}
                      onChange={(e) =>
                        setForm({ ...form, description: e.target.value })
                      }
                    />
                  </label>
                </div>

                <div className="form-actions">
                  <button
                    className="button-primary"
                    type="submit"
                    disabled={saving}
                  >
                    {saving ? "Submitting..." : `Submit ${formStatus} Report`}
                  </button>

                  <button
                    className="button-secondary"
                    type="button"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </section>
        )}

       
        <section className="reports-section" id="reports">
          <div className="section-heading">
            <div>
              <span className="eyebrow">EXPLORE THE LISTINGS</span>
              <h2>Recent Reports</h2>
              <p>Find an item or help someone recover theirs.</p>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="filters">
            <input
              className="search-input"
              type="search"
              placeholder="🔎 Search by item, location, category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              className="filter-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option>All Categories</option>
              {categories.map((entry) => (
                <option key={entry}>{entry}</option>
              ))}
            </select>

            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option>All Statuses</option>
              <option>Lost</option>
              <option>Found</option>
              <option>Returned</option>
            </select>
          </div>

          {loading ? (
            <div className="empty-state">Loading reports...</div>
          ) : filteredItems.length === 0 ? (
            <div className="empty-state">
              <div className="empty-emoji">🔎</div>
              <h3>No reports found</h3>
              <p>
                {items.length === 0
                  ? "Be the first to report a lost or found item."
                  : "Try changing your search or filters."}
              </p>
              <button
                className="button-primary"
                onClick={() => openReport("Lost")}
              >
                + Report an Item
              </button>
            </div>
          ) : (
            <div className="reports-grid">
              {filteredItems.map((item) => (
                <article className="report-card" key={item.id}>
                  <div className="item-card-top">
                    <div className="item-emoji">
                      {itemIcon(item.category)}
                    </div><br />

                    <span
                      className={`status-badge status-${item.status.toLowerCase()}`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <span className="item-category">{item.category}</span>

                  <h3>{item.name}</h3>

                  <p className="item-location">
                    📍 {item.location}
                  </p>

                  <p className="item-date">📅 {item.date}</p>

                  {item.description && (
                    <p className="item-description">{item.description}</p>
                  )}

                  <button
                    className="view-button"
                    onClick={() => setSelectedItem(item)}
                  >
                    View Details →
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>

        
        <section className="about-section" id="about">
          <span className="eyebrow">ABOUT FOUNDLINK</span>
          <h2>Helping Campus Belongings Find Their Way Home</h2>
          <p>
            FoundLink makes it easier for campus members to report lost
            belongings, share found items, and reconnect people with their
            possessions.
          </p>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-logo">F FoundLink</div>
        <p>Making lost and found simple for everyone.</p>
      </footer>

     
      {selectedItem && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="item-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="close-button modal-close"
              onClick={() => setSelectedItem(null)}
              aria-label="Close details"
            >
              ✕
            </button>

            <div className="modal-emoji">
              {itemIcon(selectedItem.category)}
            </div>

            <span
              className={`status-badge status-${selectedItem.status.toLowerCase()}`}
            >
              {selectedItem.status}
            </span>

            <h2 id="item-modal-title">{selectedItem.name}</h2>

            <div className="modal-details">
              <p>
                <strong>Category:</strong> {selectedItem.category}
              </p>
              <p>
                <strong>Location:</strong> {selectedItem.location}
              </p>
              <p>
                <strong>Date:</strong> {selectedItem.date}
              </p>
              <p>
                <strong>Description:</strong>{" "}
                {selectedItem.description || "No description provided."}
              </p>
            </div>

            <div className="modal-actions">
              {selectedItem.status !== "Returned" && (
                <button
                  className="button-primary"
                  onClick={() => markReturned(selectedItem)}
                >
                  Mark as Returned
                </button>
              )}

              <button
                className="delete-button"
                onClick={() => deleteReport(selectedItem)}
              >
                Delete Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
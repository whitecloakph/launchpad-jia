export default function DarkTableArchived() {
  const tableData = [
    {
      id: 1,
      name: "Argon Design System",
      budget: "$2,500 USD",
      status: "pending",
      completion: 60,
      members: [
        "Ryan Tompson",
        "Romina Hadid",
        "Alexander Smith",
        "Jessica Doe",
      ],
    },
    {
      id: 2,
      name: "Angular Now UI Kit PRO",
      budget: "$1,800 USD",
      status: "completed",
      completion: 100,
      members: ["Ryan Tompson", "Romina Hadid"],
    },
    {
      id: 3,
      name: "Black Dashboard",
      budget: "$3,150 USD",
      status: "delayed",
      completion: 72,
      members: ["Ryan Tompson", "Romina Hadid", "Alexander Smith"],
    },
  ];

  const getAvatarUrl = (name: string) => {
    // This would normally fetch a real avatar URL
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name
    )}&background=random`;
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-success";
      case "pending":
        return "bg-warning";
      case "delayed":
        return "bg-danger";
      default:
        return "bg-info";
    }
  };

  return (
    <div className="row mt-4">
      <div className="col">
        <div className="card bg-default shadow border-2">
          <div className="card-header bg-transparent border-0">
            <h3 className="text-white mb-0">Dark table</h3>
          </div>
          <div className="table-responsive">
            <table className="table align-items-center table-dark table-flush">
              <thead className="thead-dark">
                <tr>
                  <th scope="col" className="sort" data-sort="name">
                    Project
                  </th>
                  <th scope="col" className="sort" data-sort="budget">
                    Budget
                  </th>
                  <th scope="col" className="sort" data-sort="status">
                    Status
                  </th>
                  <th scope="col">Users</th>
                  <th scope="col" className="sort" data-sort="completion">
                    Completion
                  </th>
                  <th scope="col"></th>
                </tr>
              </thead>
              <tbody className="list">
                {tableData.map((project) => (
                  <tr key={`dark-${project.id}`}>
                    <th scope="row">
                      <div className="media align-items-center">
                        <a href="#" className="avatar rounded-circle mr-3">
                          <img
                            alt="Project avatar"
                            src={getAvatarUrl(project.name)}
                          />
                        </a>
                        <div className="media-body">
                          <span className="name mb-0 text-sm">
                            {project.name}
                          </span>
                        </div>
                      </div>
                    </th>
                    <td className="budget">{project.budget}</td>
                    <td>
                      <span
                        className={`badge badge-dot mr-4 ${getStatusBadge(
                          project.status
                        )}`}
                      >
                        <i className={getStatusBadge(project.status)}></i>
                        <span className="status">{project.status}</span>
                      </span>
                    </td>
                    <td>
                      <div className="avatar-group">
                        {project.members.map((member, idx) => (
                          <a
                            key={idx}
                            href="#"
                            className="avatar avatar-sm rounded-circle"
                            data-toggle="tooltip"
                            data-original-title={member}
                          >
                            <img
                              alt="Member avatar"
                              src={getAvatarUrl(member)}
                            />
                          </a>
                        ))}
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <span className="completion mr-2">
                          {project.completion}%
                        </span>
                        <div>
                          <div className="progress">
                            <div
                              className="progress-bar bg-success"
                              role="progressbar"
                              aria-valuenow={project.completion}
                              aria-valuemin={0}
                              aria-valuemax={100}
                              style={{ width: `${project.completion}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="text-right">
                      <div className="dropdown">
                        <a
                          className="btn btn-sm btn-icon-only text-light"
                          href="#"
                          role="button"
                          data-toggle="dropdown"
                          aria-haspopup="true"
                          aria-expanded="false"
                        >
                          <i className="fas fa-ellipsis-v"></i>
                        </a>
                        <div className="dropdown-menu dropdown-menu-right dropdown-menu-arrow">
                          <a className="dropdown-item" href="#">
                            Action
                          </a>
                          <a className="dropdown-item" href="#">
                            Another action
                          </a>
                          <a className="dropdown-item" href="#">
                            Something else here
                          </a>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

import AvatarImage from "@/lib/components/AvatarImage/AvatarImage";
import { useAppContext } from "@/lib/context/AppContext";

export default function NavBar() {
    const { user } = useAppContext();
    
    return (
          <nav className="navbar navbar-top navbar-expand navbar-dark">
            <div className="container-fluid">
              <div
                className="collapse navbar-collapse"
                id="navbarSupportedContent"
              >
                {/* Search form */}
                <form
                  className="navbar-search navbar-search-light bg-whiteform-inline mr-sm-3"
                  id="navbar-search-main"
                />
                {/* Navbar links */}
                <ul className="navbar-nav align-items-center ml-md-auto">
                  <li className="nav-item d-xl-none">
                    {/* Sidenav toggler */}
                    <div
                      className="pr-3 sidenav-toggler sidenav-toggler-dark active"
                      data-action="sidenav-pin"
                      data-target="#sidenav-main"
                    >
                      <div className="sidenav-toggler-inner">
                        <i className="sidenav-toggler-line" />
                        <i className="sidenav-toggler-line" />
                        <i className="sidenav-toggler-line" />
                      </div>
                    </div>
                  </li>
                  <li className="nav-item d-sm-none">
                    <a
                      className="nav-link"
                      href="#"
                      data-action="search-show"
                      data-target="#navbar-search-main"
                    >
                      <i className="ni ni-zoom-split-in" />
                    </a>
                  </li>
                  <li className="nav-item dropdown">
                    <a
                      className="nav-link"
                      href="#"
                      role="button"
                      data-toggle="dropdown"
                      aria-haspopup="true"
                      aria-expanded="false"
                    >
                      <i className="ni ni-bell-55" />
                    </a>
                  </li>
                </ul>
                <ul className="navbar-nav align-items-center ml-auto ml-md-0">
                  <li className="nav-item dropdown">
                    <a
                      className="nav-link pr-0"
                      href="#"
                      role="button"
                      data-toggle="dropdown"
                      aria-haspopup="true"
                      aria-expanded="false"
                    >
                      <div className="media align-items-center d-flex">
                        <span className="avatar avatar-sm rounded-circle d-flex justify-content-center align-items-center">
                          <AvatarImage alt="Avatar" src={user?.image} />
                        </span>
                        <div className="media-body ml-2 d-none d-lg-block">
                          <span className="mb-0 text-sm font-weight-bold text-white">
                            {user?.name}
                          </span>
                        </div>
                      </div>
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </nav>
  );
}
import APIService from "../../APIService"

const apiService = new APIService();

class AuthService{

  hasJWT = () => {
    let flag = false;
    localStorage.getItem("access") && localStorage.getItem("refesh") ? flag=true : flag=false;
    return flag
  }

  getTokens = (username, password) => {
    return apiService.sendPost('/api/accounts/token/', {username, password})
    .then(response => {
      localStorage.setItem('access', response.data.access);
      localStorage.setItem('refresh', response.data.refresh);
      this.setTokenInHeaders();
      return response;
    })
  }

  refreshAccessToken = () => {
    const refresh = localStorage.getItem('refresh');
    return apiService.sendPost('/api/accounts/token/refresh/', {refresh})
      .then(response => {
        localStorage.setItem('access', response.data.access);
      })
  }

  isTokenValid = (token) => {
    return apiService.sendPost('/api/accounts/token/verify/', {token})
    .then(response => {
      return true;
    })
    .catch(error => {
      return false;
    })
  }

  isAccessTokenValid = () => {
    const access = localStorage.getItem('access');
    return this.isTokenValid(access);
  }

  isRefreshTokenValid = () => {
    const refresh = localStorage.getItem('refresh');
    return this.isTokenValid(refresh);
  }

  logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    this.deleteTokenFromHeaders();
  }

  register = (username, email, password) => {
    return apiService.sendPost('/api/accounts/register/', {username, email, password})
      .then(response => {
        localStorage.setItem('access', response.data.access);
        localStorage.setItem('refresh', response.data.refresh);
        this.setTokenInHeaders();
      })
  }

  isLogged = () => {
    return this.isAccessTokenValid()
    .then(response => {
      if (response) {
        // this.refreshAccessToken()
        // .catch(error => {
        //   alert('3 ' + JSON.stringify(error.response));
          return true;
      } else {
          return false;
        }
    });
  }

  setTokenInHeaders = () => {
    const token = localStorage.getItem('access');
    if (!token) {
      apiService.deleteDefaultHeaders();
    }
    apiService.setDefaultHeaders('Authorization', `Bearer ${token}`);
    // axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }

  deleteTokenFromHeaders = () => {
    apiService.deleteDefaultHeaders('Authorization');
    // delete axios.defaults.headers.common["Authorization"];
  }
}

export default AuthService;
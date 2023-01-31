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
        AuthService.setTokenInHeaders();
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

  isLogged = (withoutRefresh=false) => {
    return this.isAccessTokenValid()
    .then(response => {
      if (response) {
        this.setTokenInHeaders();
        return true
      }
      if (withoutRefresh) {
        this.deleteTokenFromHeaders()
        return false
      }
      return this.refreshAccessToken().then(() => {
        return this.isLogged(withoutRefresh=true);
      })
      .catch(() => {
        return this.isLogged(withoutRefresh=true);
      })
    })
  }

  setTokenInHeaders = () => {
    const token = localStorage.getItem('access');
    if (!token) {
      this.deleteTokenFromHeaders();
    } else {
      apiService.setDefaultHeaders('Authorization', `Bearer ${token}`);
    }
  }

  deleteTokenFromHeaders = () => {
    apiService.deleteDefaultHeaders('Authorization');
  }
}

export default AuthService;
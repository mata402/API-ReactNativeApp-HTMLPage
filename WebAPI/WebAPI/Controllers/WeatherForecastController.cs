using Microsoft.AspNetCore.Mvc;
using System.Net.Http;
using Microsoft.AspNetCore.Mvc.ModelBinding.Binders;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Cors;

namespace WebAPI.Controllers
{
    [ApiController]
    [Route("user")]
    public class UserController : ControllerBase
    {
        [HttpGet]
        [Route("generate-token/{id}")]
        //[EnableCors("All")]
        public TokenModel GetToken(string id)
        {
            var m = new TokenModel();
            m.originalId = id;

            char[] idArray = id.ToUpper().ToCharArray();
            Random random = new Random();

            for (int i = 0; i < idArray.Length; i++)
            {
                int randomIndex = random.Next(i, idArray.Length);
                char temp = idArray[i];
                idArray[i] = idArray[randomIndex];
                idArray[randomIndex] = temp;
            }

            for (int i = 0; i < idArray.Length; i++)
            {
                char originalChar = idArray[i];
                char encryptedChar = (char)(originalChar - 26);

                if (char.IsLetterOrDigit(encryptedChar))
                {
                    idArray[i] = encryptedChar;
                }
                else
                {
                    idArray[i] = originalChar;
                }
            }

            string newid = new string(idArray);
            m.token = "token" + newid;

            return m;
        }
        [HttpGet]
        [Route("generate-users")]
        public async Task<IActionResult> GenerateUsers()
        {
            using (HttpClient client = new HttpClient())
            {
                HttpResponseMessage response = await client.GetAsync("https://randomuser.me/api/?results=20");

                if (response.IsSuccessStatusCode)
                {
                    string responseBody = await response.Content.ReadAsStringAsync();
                    return Content(responseBody, "application/json");
                }
                else
                {
                    return StatusCode((int)response.StatusCode);
                }
            }
        }
    }

    public class TokenModel
    {
        public string originalId { get; set; }
        public string token { get; set; }
    }
}
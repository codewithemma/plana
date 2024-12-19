// import { isEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

// export class CreateUserDto {
//   @isEmail()
//   email: string;

//   @IsString()
//   @IsNotEmpty()
//   @MinLength(6)
//   password: string;

//   @IsString()
//   @IsNotEmpty()
//   name: string;

//   // Optional: Add a constructor for preprocessing
//   constructor(email: string, password: string, name: string) {
//     this.email = email.trim().toLowerCase(); // Normalize email
//     this.password = password;
//     this.name = name.trim();
//   }
// }

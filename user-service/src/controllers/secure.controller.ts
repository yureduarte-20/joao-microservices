// Uncomment these imports to begin using these cool features!

import {inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {HttpErrors, getModelSchemaRef, post, requestBody, response} from '@loopback/rest';
import {Roles, Services, TokenServiceBindings, UserServiceBindings} from '../keys';
import {User} from '../models';
import {UserRepository} from '../repositories';
import {JWTService} from '../services/jwt-service';
import {MyUserService} from '../services/user-service';
import {generateHash} from '../utils/password';

// import {inject} from '@loopback/core';


export class SecureController {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
    @inject(UserServiceBindings.USER_SERVICE)
    public userService: MyUserService,
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public jwtService: JWTService,
  ) { }

  @post('/login')
  @response(200, {
    description: 'User model instance',
    content: {'application/json': {schema: getModelSchemaRef(User)}},
  })
  async checkPassword(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            properties: {
              email: {
                type: 'string'
              },
              password: {
                type: 'string'
              }
            },
            required: ['password', 'email']
          }
        },
      },
    })
    reqBody: {password: string, email: string}
  ) {
    const user = await this.userService.verifyCredentials(reqBody);
    if (user) {
      const userProfile = this.userService.convertToUserProfile(user);
      const token = await this.jwtService.generateToken(userProfile);
      return Promise.resolve({token})
    }
    return Promise.reject(new HttpErrors.Unauthorized('Senha incorreta'))
  }
  @post('/signup')
  @response(200, {
    description: 'User model instance',
    content: {'application/json': {schema: getModelSchemaRef(User)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {
            title: 'NewUser',
            exclude: ['id'],
          }),
        },
      },
    })
    user: Omit<User, 'id'>,
  ): Promise<User> {

    user.email = user.email.trim().toLowerCase();
    const {count} = await this.userRepository.count({email: user.email})
    if (count > 0) return Promise.reject(new HttpErrors.UnprocessableEntity('Email já cadastrado.'))
    user.password = await generateHash(user.password)
    user.responsibilities = [
      {role: Roles.STUDENT, service: Services.USER_SERVICE},
      {role: Roles.STUDENT, service: Services.PROBLEM_SERVICE},
      {role: Roles.STUDENT, service: Services.CHAT_SERVICE},
      {role: Roles.STUDENT, service: Services.JUDGE_SERVICE}]

    return this.userRepository.create(user);
  }
}
